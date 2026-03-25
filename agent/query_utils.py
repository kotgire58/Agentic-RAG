"""
Query classification utilities (no heavy dependencies).
"""

import re

# Patterns that suggest multihop/relationship questions (vector search struggles with these)
_MULTIHOP_PATTERNS = (
    r"connected to",
    r"connection between",
    r"relationship between",
    r"how is .+ connected",
    r"how does .+ relate",
    r"path from",
    r"path between",
    r"trace the",
    r"link between",
    r"investment path",
    r"funding path",
    r"chain of",
    r"connect .+ to",
    r"relate .+ to",
)


def is_multihop_query(query: str) -> bool:
    """
    Heuristic: detect queries that ask about relationships/connections across hops.
    Vector search returns scattered chunks; graph search is needed for these.

    Args:
        query: User search query

    Returns:
        True if the query appears to be a multihop/relationship question
    """
    if not query or not query.strip():
        return False
    q = query.lower().strip()
    for pat in _MULTIHOP_PATTERNS:
        if re.search(pat, q):
            return True
    return False
