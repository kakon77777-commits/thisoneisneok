"""git's `signature` field.

a cryptographic operation someone had to perform with a key
"""
NAME = "signature"
KIND = "act"
WHAT_IT_RECORDS = "a cryptographic operation someone had to perform with a key"

# The ceiling, and it is the finding of the entry: when nobody signs, %G? reports
# N for an honest commit and for an impersonation alike. A field that CAN be an
# act is not one until someone performs it.
UNIFORM_WHEN_UNUSED = "N"
