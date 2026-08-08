"""The current name. Imports nothing."""

NAME = "warning"


def emit(buffer, message):
    buffer.write(f"WARNING:{message}\n")
    return None
