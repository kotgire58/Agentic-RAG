"""
Graph utilities for Neo4j/Graphiti integration.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import asyncio

from graphiti_core import Graphiti
from graphiti_core.utils.maintenance.graph_data_operations import clear_data
from graphiti_core.llm_client.config import LLMConfig
from graphiti_core.llm_client.openai_client import OpenAIClient
from graphiti_core.embedder.openai import OpenAIEmbedder, OpenAIEmbedderConfig
from graphiti_core.cross_encoder.openai_reranker_client import OpenAIRerankerClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Help from this PR for setting up the custom clients: https://github.com/getzep/graphiti/pull/601/files
class GraphitiClient:
    """Manages Graphiti knowledge graph operations."""
    
    def __init__(
        self,
        neo4j_uri: Optional[str] = None,
        neo4j_user: Optional[str] = None,
        neo4j_password: Optional[str] = None
    ):
        """
        Initialize Graphiti client.
        
        Args:
            neo4j_uri: Neo4j connection URI
            neo4j_user: Neo4j username
            neo4j_password: Neo4j password
        """
        # Neo4j configuration
        self.neo4j_uri = neo4j_uri or os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.neo4j_user = neo4j_user or os.getenv("NEO4J_USER", "neo4j")
        self.neo4j_password = neo4j_password or os.getenv("NEO4J_PASSWORD")
        
        if not self.neo4j_password:
            raise ValueError("NEO4J_PASSWORD environment variable not set")
        
        # LLM configuration
        self.llm_base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        self.llm_api_key = os.getenv("LLM_API_KEY")
        self.llm_choice = os.getenv("LLM_CHOICE", "gpt-4.1-mini")
        
        if not self.llm_api_key:
            raise ValueError("LLM_API_KEY environment variable not set")
        
        # Embedding configuration
        self.embedding_base_url = os.getenv("EMBEDDING_BASE_URL", "https://api.openai.com/v1")
        self.embedding_api_key = os.getenv("EMBEDDING_API_KEY")
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
        self.embedding_dimensions = int(os.getenv("VECTOR_DIMENSION", "1536"))
        
        if not self.embedding_api_key:
            raise ValueError("EMBEDDING_API_KEY environment variable not set")
        
        self.graphiti: Optional[Graphiti] = None
        self._initialized = False
    
    async def initialize(self):
        """Initialize Graphiti client."""
        if self._initialized:
            return
        
        try:
            # Create LLMConfig
            llm_config = LLMConfig(
                api_key=self.llm_api_key,
                model=self.llm_choice,
                small_model=self.llm_choice,  # Can be the same as main model
                base_url=self.llm_base_url
            )
            
            # Create OpenAI LLM client
            llm_client = OpenAIClient(config=llm_config)
            
            # Create OpenAI embedder
            embedder = OpenAIEmbedder(
                config=OpenAIEmbedderConfig(
                    api_key=self.embedding_api_key,
                    embedding_model=self.embedding_model,
                    embedding_dim=self.embedding_dimensions,
                    base_url=self.embedding_base_url
                )
            )
            
            # Initialize Graphiti with custom clients
            self.graphiti = Graphiti(
                self.neo4j_uri,
                self.neo4j_user,
                self.neo4j_password,
                llm_client=llm_client,
                embedder=embedder,
                cross_encoder=OpenAIRerankerClient(client=llm_client, config=llm_config)
            )
            
            # Build indices and constraints
            await self.graphiti.build_indices_and_constraints()
            
            self._initialized = True
            logger.info(f"Graphiti client initialized successfully with LLM: {self.llm_choice} and embedder: {self.embedding_model}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Graphiti: {e}")
            raise
    
    async def close(self):
        """Close Graphiti connection."""
        if self.graphiti:
            await self.graphiti.close()
            self.graphiti = None
            self._initialized = False
            logger.info("Graphiti client closed")
    
    async def add_episode(
        self,
        episode_id: str,
        content: str,
        source: str,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Add an episode to the knowledge graph.
        
        Args:
            episode_id: Unique episode identifier
            content: Episode content
            source: Source of the content
            timestamp: Episode timestamp
            metadata: Additional metadata
        """
        if not self._initialized:
            await self.initialize()
        
        episode_timestamp = timestamp or datetime.now(timezone.utc)
        
        # Import EpisodeType for proper source handling
        from graphiti_core.nodes import EpisodeType
        
        await self.graphiti.add_episode(
            name=episode_id,
            episode_body=content,
            source=EpisodeType.text,  # Always use text type for our content
            source_description=source,
            reference_time=episode_timestamp
        )
        
        logger.info(f"Added episode {episode_id} to knowledge graph")
    
    async def search(
        self,
        query: str,
        center_node_distance: int = 2,
        use_hybrid_search: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search the knowledge graph.
        
        Args:
            query: Search query
            center_node_distance: Distance from center nodes
            use_hybrid_search: Whether to use hybrid search
        
        Returns:
            Search results
        """
        if not self._initialized:
            await self.initialize()
        
        try:
            # Use Graphiti's search method (simplified parameters)
            results = await self.graphiti.search(query)
            
            # Convert results to dictionaries
            return [
                {
                    "fact": result.fact,
                    "uuid": str(result.uuid),
                    "valid_at": str(result.valid_at) if hasattr(result, 'valid_at') and result.valid_at else None,
                    "invalid_at": str(result.invalid_at) if hasattr(result, 'invalid_at') and result.invalid_at else None,
                    "source_node_uuid": str(result.source_node_uuid) if hasattr(result, 'source_node_uuid') and result.source_node_uuid else None
                }
                for result in results
            ]
            
        except Exception as e:
            logger.error(f"Graph search failed: {e}")
            return []
    
    async def get_related_entities(
        self,
        entity_name: str,
        relationship_types: Optional[List[str]] = None,
        depth: int = 1
    ) -> Dict[str, Any]:
        """
        Get entities related to a given entity using Graphiti search.
        
        Args:
            entity_name: Name of the entity
            relationship_types: Types of relationships to follow (not used with Graphiti)
            depth: Maximum depth to traverse (not used with Graphiti)
        
        Returns:
            Related entities and relationships
        """
        if not self._initialized:
            await self.initialize()
        
        # Use Graphiti search to find related information about the entity
        results = await self.graphiti.search(f"relationships involving {entity_name}")
        
        # Extract entity information from the search results
        related_entities = set()
        facts = []
        
        for result in results:
            facts.append({
                "fact": result.fact,
                "uuid": str(result.uuid),
                "valid_at": str(result.valid_at) if hasattr(result, 'valid_at') and result.valid_at else None
            })
            
            # Simple entity extraction from fact text (could be enhanced)
            if entity_name.lower() in result.fact.lower():
                related_entities.add(entity_name)
        
        return {
            "central_entity": entity_name,
            "related_facts": facts,
            "search_method": "graphiti_semantic_search"
        }
    
    async def get_entity_timeline(
        self,
        entity_name: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Get timeline of facts for an entity using Graphiti.
        
        Args:
            entity_name: Name of the entity
            start_date: Start of time range (not currently used)
            end_date: End of time range (not currently used)
        
        Returns:
            Timeline of facts
        """
        if not self._initialized:
            await self.initialize()
        
        # Search for temporal information about the entity
        results = await self.graphiti.search(f"timeline history of {entity_name}")
        
        timeline = []
        for result in results:
            timeline.append({
                "fact": result.fact,
                "uuid": str(result.uuid),
                "valid_at": str(result.valid_at) if hasattr(result, 'valid_at') and result.valid_at else None,
                "invalid_at": str(result.invalid_at) if hasattr(result, 'invalid_at') and result.invalid_at else None
            })
        
        # Sort by valid_at if available
        timeline.sort(key=lambda x: x.get('valid_at') or '', reverse=True)
        
        return timeline
    
    async def get_graph_statistics(self) -> Dict[str, Any]:
        """
        Get basic statistics about the knowledge graph.
        
        Returns:
            Graph statistics
        """
        if not self._initialized:
            await self.initialize()
        
        # For now, return a simple search to verify the graph is working
        # More detailed statistics would require direct Neo4j access
        try:
            test_results = await self.graphiti.search("test")
            return {
                "graphiti_initialized": True,
                "sample_search_results": len(test_results),
                "note": "Detailed statistics require direct Neo4j access"
            }
        except Exception as e:
            return {
                "graphiti_initialized": False,
                "error": str(e)
            }
    
    async def get_subgraph(
        self,
        node_uuids: List[str],
        max_hops: int = 2
    ) -> Dict[str, Any]:
        """
        Fetch induced subgraph for visualization: only seed nodes and edges
        between them. No expansion to neighbors.

        Args:
            node_uuids: List of entity node UUIDs (e.g. from search source_node_uuid)
            max_hops: Unused; kept for API compatibility

        Returns:
            Dict with "nodes" and "edges" for visualization
        """
        if not node_uuids:
            return {"nodes": [], "edges": []}

        if not self._initialized:
            await self.initialize()

        try:
            driver = self.graphiti.driver

            # Induced subgraph only: nodes that were in the search results (seed set)
            # and edges that connect those nodes. No expansion to neighbors.
            cypher_induced = """
            MATCH (n) WHERE n.uuid IN $uuids
            OPTIONAL MATCH (n)-[r]-(m)
            WHERE m.uuid IN $uuids AND m IS NOT NULL AND n <> m AND r IS NOT NULL
            RETURN n, r, m
            """

            nodes_by_id: Dict[str, Dict[str, Any]] = {}
            edges_set: set = set()

            records = []
            async with driver.session(database="neo4j") as session:
                result = await session.run(cypher_induced, uuids=node_uuids)
                async for record in result:
                    records.append(record)

            for record in records:
                n, r, m = record.get("n"), record.get("r"), record.get("m")
                if n is None:
                    continue

                def node_to_dict(node) -> Dict[str, Any]:
                    if node is None:
                        return {}
                    nid = node.element_id if hasattr(node, "element_id") else str(id(node))
                    uuid_val = node.get("uuid", nid) if hasattr(node, "get") else nid
                    name_val = node.get("name", uuid_val) if hasattr(node, "get") else uuid_val
                    labels = list(node.labels) if hasattr(node, "labels") else ["Entity"]
                    return {
                        "id": str(uuid_val),
                        "label": str(name_val) if name_val else str(nid),
                        "type": labels[0] if labels else "Entity",
                    }

                def rel_to_edge(rel, src_node, tgt_node) -> Optional[tuple]:
                    if rel is None or src_node is None or tgt_node is None:
                        return None
                    src_id = src_node.get("uuid", getattr(src_node, "element_id", str(id(src_node)))) if hasattr(src_node, "get") else str(id(src_node))
                    tgt_id = tgt_node.get("uuid", getattr(tgt_node, "element_id", str(id(tgt_node)))) if hasattr(tgt_node, "get") else str(id(tgt_node))
                    rel_type = rel.type if hasattr(rel, "type") else str(type(rel).__name__)
                    return (str(src_id), str(tgt_id), rel_type)

                nodes_by_id[node_to_dict(n)["id"]] = node_to_dict(n)
                if m is not None:
                    nodes_by_id[node_to_dict(m)["id"]] = node_to_dict(m)
                if r is not None and m is not None:
                    edge = rel_to_edge(r, n, m)
                    if edge:
                        # Normalize so (A,B) and (B,A) don't duplicate
                        src, tgt, rel_type = edge
                        key = (min(src, tgt), max(src, tgt), rel_type)
                        edges_set.add(key)

            edges = [
                {"source": src, "target": tgt, "type": rel_type}
                for src, tgt, rel_type in edges_set
            ]
            nodes = list(nodes_by_id.values())

            return {"nodes": nodes, "edges": edges}

        except Exception as e:
            logger.warning(f"Subgraph extraction failed: {e}")
            return {"nodes": [], "edges": []}

    async def get_subgraph_by_entity_name(
        self,
        entity_name: str,
        max_neighbors: int = 20
    ) -> Dict[str, Any]:
        """
        Fetch 1-hop neighborhood for an entity by name (for relationships viz).
        Finds Entity nodes matching the name and returns entity + direct neighbors.

        Args:
            entity_name: Entity name to look up (case-insensitive partial match)
            max_neighbors: Max nodes to return (avoids huge graphs)

        Returns:
            Dict with "nodes" and "edges" for visualization
        """
        if not entity_name or not entity_name.strip():
            return {"nodes": [], "edges": []}

        if not self._initialized:
            await self.initialize()

        try:
            driver = self.graphiti.driver

            # Find Entity nodes by name (case-insensitive), get 1-hop neighborhood
            cypher = """
            MATCH (n:Entity)
            WHERE toLower(n.name) CONTAINS toLower($entity_name)
               OR toLower(n.name) = toLower($entity_name)
            WITH n LIMIT 3
            OPTIONAL MATCH (n)-[r]-(m)
            WHERE m IS NOT NULL AND r IS NOT NULL
            WITH n, r, m
            LIMIT $max_limit
            RETURN n, r, m
            """

            nodes_by_id: Dict[str, Dict[str, Any]] = {}
            edges_set: set = set()
            max_limit = max_neighbors * 2  # Rough limit for rows

            records = []
            async with driver.session(database="neo4j") as session:
                result = await session.run(
                    cypher,
                    entity_name=entity_name.strip(),
                    max_limit=max_limit
                )
                async for record in result:
                    records.append(record)

            for record in records:
                n, r, m = record.get("n"), record.get("r"), record.get("m")
                if n is None:
                    continue

                def node_to_dict(node) -> Dict[str, Any]:
                    if node is None:
                        return {}
                    nid = node.element_id if hasattr(node, "element_id") else str(id(node))
                    uuid_val = node.get("uuid", nid) if hasattr(node, "get") else nid
                    name_val = node.get("name", uuid_val) if hasattr(node, "get") else uuid_val
                    labels = list(node.labels) if hasattr(node, "labels") else ["Entity"]
                    return {
                        "id": str(uuid_val),
                        "label": str(name_val) if name_val else str(nid),
                        "type": labels[0] if labels else "Entity",
                    }

                def rel_to_edge(rel, src_node, tgt_node) -> Optional[tuple]:
                    if rel is None or src_node is None or tgt_node is None:
                        return None
                    src_id = src_node.get("uuid", getattr(src_node, "element_id", str(id(src_node)))) if hasattr(src_node, "get") else str(id(src_node))
                    tgt_id = tgt_node.get("uuid", getattr(tgt_node, "element_id", str(id(tgt_node)))) if hasattr(tgt_node, "get") else str(id(tgt_node))
                    rel_type = rel.type if hasattr(rel, "type") else str(type(rel).__name__)
                    return (str(src_id), str(tgt_id), rel_type)

                nodes_by_id[node_to_dict(n)["id"]] = node_to_dict(n)
                if m is not None:
                    nodes_by_id[node_to_dict(m)["id"]] = node_to_dict(m)
                if r is not None and m is not None:
                    edge = rel_to_edge(r, n, m)
                    if edge:
                        src, tgt, rel_type = edge
                        key = (min(src, tgt), max(src, tgt), rel_type)
                        edges_set.add(key)

                if len(nodes_by_id) >= max_neighbors:
                    break

            edges = [
                {"source": src, "target": tgt, "type": rel_type}
                for src, tgt, rel_type in edges_set
            ]
            nodes = list(nodes_by_id.values())

            return {"nodes": nodes, "edges": edges}

        except Exception as e:
            logger.warning(f"Subgraph by entity failed: {e}")
            return {"nodes": [], "edges": []}

    async def clear_graph(self):
        """Clear all data from the graph (USE WITH CAUTION)."""
        if not self._initialized:
            await self.initialize()
        
        try:
            # Use Graphiti's proper clear_data function with the driver
            await clear_data(self.graphiti.driver)
            logger.warning("Cleared all data from knowledge graph")
        except Exception as e:
            logger.error(f"Failed to clear graph using clear_data: {e}")
            # Fallback: Close and reinitialize (this will create fresh indices)
            if self.graphiti:
                await self.graphiti.close()
            
            # Create OpenAI-compatible clients for reinitialization
            llm_config = LLMConfig(
                api_key=self.llm_api_key,
                model=self.llm_choice,
                small_model=self.llm_choice,
                base_url=self.llm_base_url
            )
            
            llm_client = OpenAIClient(config=llm_config)
            
            embedder = OpenAIEmbedder(
                config=OpenAIEmbedderConfig(
                    api_key=self.embedding_api_key,
                    embedding_model=self.embedding_model,
                    embedding_dim=self.embedding_dimensions,
                    base_url=self.embedding_base_url
                )
            )
            
            self.graphiti = Graphiti(
                self.neo4j_uri,
                self.neo4j_user,
                self.neo4j_password,
                llm_client=llm_client,
                embedder=embedder,
                cross_encoder=OpenAIRerankerClient(client=llm_client, config=llm_config)
            )
            await self.graphiti.build_indices_and_constraints()
            
            logger.warning("Reinitialized Graphiti client (fresh indices created)")


# Global Graphiti client instance
graph_client = GraphitiClient()


async def initialize_graph():
    """Initialize graph client."""
    await graph_client.initialize()


async def close_graph():
    """Close graph client."""
    await graph_client.close()


# Convenience functions for common operations
async def add_to_knowledge_graph(
    content: str,
    source: str,
    episode_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> str:
    """
    Add content to the knowledge graph.
    
    Args:
        content: Content to add
        source: Source of the content
        episode_id: Optional episode ID
        metadata: Optional metadata
    
    Returns:
        Episode ID
    """
    if not episode_id:
        episode_id = f"episode_{datetime.now(timezone.utc).isoformat()}"
    
    await graph_client.add_episode(
        episode_id=episode_id,
        content=content,
        source=source,
        metadata=metadata
    )
    
    return episode_id


async def search_knowledge_graph(
    query: str
) -> List[Dict[str, Any]]:
    """
    Search the knowledge graph.
    
    Args:
        query: Search query
    
    Returns:
        Search results
    """
    return await graph_client.search(query)


async def search_knowledge_graph_with_visualization(
    query: str,
    max_visualization_nodes: int = 12
) -> Dict[str, Any]:
    """
    Search the knowledge graph and fetch subgraph for visualization.
    Only returns nodes that appeared in the search results (traversed) and
    edges between them—no expansion to the full graph.

    Args:
        query: Search query
        max_visualization_nodes: Max seed nodes to include (keeps viz focused)

    Returns:
        Dict with "results" (list of search results) and "graph_data" (nodes, edges)
    """
    results = await graph_client.search(query)
    node_uuids = [
        r["source_node_uuid"]
        for r in results
        if r.get("source_node_uuid")
    ]
    node_uuids = list(dict.fromkeys(node_uuids))[:max_visualization_nodes]  # dedupe, limit
    graph_data = await graph_client.get_subgraph(node_uuids)
    return {
        "results": results,
        "graph_data": graph_data,
    }


async def get_entity_relationships(
    entity: str,
    depth: int = 2
) -> Dict[str, Any]:
    """
    Get relationships for an entity.
    
    Args:
        entity: Entity name
        depth: Maximum traversal depth
    
    Returns:
        Entity relationships
    """
    return await graph_client.get_related_entities(entity, depth=depth)


async def get_subgraph_by_entity_name(
    entity_name: str,
    max_neighbors: int = 20
) -> Dict[str, Any]:
    """
    Fetch 1-hop neighborhood for an entity by name (for relationships/timeline viz).

    Args:
        entity_name: Entity name to look up
        max_neighbors: Max nodes to return

    Returns:
        Dict with "nodes" and "edges" for visualization
    """
    return await graph_client.get_subgraph_by_entity_name(
        entity_name=entity_name,
        max_neighbors=max_neighbors
    )


async def test_graph_connection() -> bool:
    """
    Test graph database connection.
    
    Returns:
        True if connection successful
    """
    try:
        await graph_client.initialize()
        stats = await graph_client.get_graph_statistics()
        logger.info(f"Graph connection successful. Stats: {stats}")
        return True
    except Exception as e:
        logger.error(f"Graph connection test failed: {e}")
        return False