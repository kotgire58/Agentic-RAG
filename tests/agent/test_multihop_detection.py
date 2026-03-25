"""
Tests for multihop query detection in vector search.
"""

import pytest

from agent.query_utils import is_multihop_query


def test_multihop_detected_connected_to():
    """Queries about connections are detected."""
    assert is_multihop_query("How is Microsoft connected to OpenAI?") is True
    assert is_multihop_query("What is the connection between Meta and AI?") is True


def test_multihop_detected_relationship():
    """Relationship questions are detected."""
    assert is_multihop_query("What's the relationship between Google and DeepMind?") is True


def test_multihop_detected_path():
    """Path/trace questions are detected."""
    assert is_multihop_query("Trace the investment path from Sequoia to Anthropic") is True
    assert is_multihop_query("What's the path between Microsoft and ChatGPT?") is True


def test_non_multihop_simple_fact():
    """Simple factual queries are not detected."""
    assert is_multihop_query("What is Meta's AI strategy?") is False
    assert is_multihop_query("When did OpenAI release GPT-4?") is False
    assert is_multihop_query("List Microsoft investments") is False


def test_multihop_empty_or_whitespace():
    """Empty queries return False."""
    assert is_multihop_query("") is False
    assert is_multihop_query("   ") is False
