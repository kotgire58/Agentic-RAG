"""
Tests for graph visualization (subgraph extraction and search with visualization).
"""

import pytest
from unittest.mock import AsyncMock, patch

from agent.models import GraphNode, GraphEdge, GraphVisualizationData


@pytest.mark.asyncio
async def test_search_graph_endpoint_returns_visualization_data():
    """POST /search/graph returns graph_results and graph_data for visualization."""
    pytest.importorskip("graphiti_core", reason="graphiti not installed")
    import agent.api  # Ensure module loaded for patch target

    mock_data = {
        "results": [
            {
                "fact": "Microsoft invested in OpenAI",
                "uuid": "f1",
                "valid_at": None,
                "invalid_at": None,
                "source_node_uuid": "node-1",
            },
        ],
        "graph_data": {
            "nodes": [
                {"id": "node-1", "label": "Microsoft", "type": "Entity"},
                {"id": "node-2", "label": "OpenAI", "type": "Entity"},
            ],
            "edges": [
                {"source": "node-1", "target": "node-2", "type": "RELATES_TO"},
            ],
        },
    }

    with patch("agent.api.search_knowledge_graph_with_visualization", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = mock_data

        from fastapi.testclient import TestClient
        from agent.api import app

        client = TestClient(app)
        response = client.post(
            "/search/graph",
            json={"query": "Microsoft OpenAI", "search_type": "graph", "limit": 10},
        )

    assert response.status_code == 200
    data = response.json()
    assert "graph_results" in data
    assert "graph_data" in data
    assert len(data["graph_results"]) == 1
    assert data["graph_results"][0]["fact"] == "Microsoft invested in OpenAI"
    assert data["graph_data"] is not None
    assert len(data["graph_data"]["nodes"]) == 2
    assert len(data["graph_data"]["edges"]) == 1


@pytest.mark.asyncio
async def test_entity_graph_endpoint_returns_visualization_data():
    """POST /search/graph/entity returns graph_data for entity neighborhood."""
    pytest.importorskip("graphiti_core", reason="graphiti not installed")

    mock_graph_data = {
        "nodes": [
            {"id": "e1", "label": "Microsoft", "type": "Entity"},
            {"id": "e2", "label": "OpenAI", "type": "Entity"},
        ],
        "edges": [
            {"source": "e1", "target": "e2", "type": "INVESTED_IN"},
        ],
    }

    with patch(
        "agent.api.get_subgraph_by_entity_name", new_callable=AsyncMock
    ) as mock_get_subgraph:
        mock_get_subgraph.return_value = mock_graph_data

        from fastapi.testclient import TestClient
        from agent.api import app

        client = TestClient(app)
        response = client.post(
            "/search/graph/entity",
            json={"entity_name": "Microsoft", "max_neighbors": 20},
        )

    assert response.status_code == 200
    data = response.json()
    assert "graph_data" in data
    assert data["graph_data"] is not None
    assert len(data["graph_data"]["nodes"]) == 2
    assert len(data["graph_data"]["edges"]) == 1


@pytest.mark.asyncio
async def test_get_subgraph_by_entity_name_delegates_to_client():
    """get_subgraph_by_entity_name delegates to graph_client and returns result."""
    pytest.importorskip("graphiti_core", reason="graphiti not installed")
    from agent.graph_utils import get_subgraph_by_entity_name

    expected = {"nodes": [{"id": "1", "label": "Foo", "type": "Entity"}], "edges": []}
    with patch(
        "agent.graph_utils.graph_client.get_subgraph_by_entity_name",
        new_callable=AsyncMock,
    ) as mock_client:
        mock_client.return_value = expected
        result = await get_subgraph_by_entity_name(entity_name="Foo", max_neighbors=10)
        mock_client.assert_called_once_with(entity_name="Foo", max_neighbors=10)
        assert result == expected


@pytest.mark.asyncio
async def test_get_subgraph_by_entity_name_empty_returns_empty():
    """get_subgraph_by_entity_name returns empty when entity_name is empty."""
    pytest.importorskip("graphiti_core", reason="graphiti not installed")
    from agent.graph_utils import get_subgraph_by_entity_name

    result = await get_subgraph_by_entity_name(entity_name="")
    assert result == {"nodes": [], "edges": []}


def test_graph_visualization_data_models():
    """GraphNode and GraphEdge validate correctly."""
    node = GraphNode(id="1", label="Entity", type="Entity")
    assert node.id == "1"
    assert node.label == "Entity"

    edge = GraphEdge(source="1", target="2", type="RELATES_TO")
    assert edge.source == "1"
    assert edge.target == "2"

    gvd = GraphVisualizationData(nodes=[node], edges=[edge])
    assert len(gvd.nodes) == 1
    assert len(gvd.edges) == 1
