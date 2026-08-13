"""What real git records, measured in a throwaway repository.

Nothing here is an exploit. GIT_AUTHOR_NAME and GIT_COMMITTER_NAME are
documented environment variables, and a Co-Authored-By trailer is a line of the
commit message.
"""
import os
import subprocess
import tempfile

IMPERSONATED = ("Linus Torvalds", "torvalds@linux-foundation.org")


def _git(cwd, *args, env=None):
    return subprocess.run(("git",) + args, cwd=cwd, env=env,
                          capture_output=True, text=True).stdout


def build_repository():
    """Three commits: honest, impersonating, and one with an unchecked trailer."""
    directory = tempfile.mkdtemp()
    _git(directory, "init", "-q")
    _git(directory, "config", "user.name", "Real Person")
    _git(directory, "config", "user.email", "real@example.com")
    _git(directory, "config", "commit.gpgsign", "false")

    open(os.path.join(directory, "a.txt"), "w").write("one\n")
    _git(directory, "add", "-A")
    _git(directory, "commit", "-q", "-m", "an ordinary commit")

    open(os.path.join(directory, "b.txt"), "w").write("two\n")
    _git(directory, "add", "-A")
    env = dict(os.environ, GIT_AUTHOR_NAME=IMPERSONATED[0], GIT_AUTHOR_EMAIL=IMPERSONATED[1],
               GIT_COMMITTER_NAME=IMPERSONATED[0], GIT_COMMITTER_EMAIL=IMPERSONATED[1])
    _git(directory, "commit", "-q", "-m", "a commit by someone who was not there", env=env)

    open(os.path.join(directory, "c.txt"), "w").write("three\n")
    _git(directory, "add", "-A")
    _git(directory, "commit", "-q", "-m",
         "work\n\nCo-Authored-By: Someone Who Never Saw This <nobody@example.com>")
    return directory


def commits(directory):
    rows = []
    for line in _git(directory, "log", "--reverse",
                     "--format=%h\t%an\t%cn\t%G?\t%s").strip().splitlines():
        short, author, committer, sig, subject = (line.split("\t") + [""] * 5)[:5]
        rows.append({"commit": short, "author": author, "committer": committer,
                     "signature_status": sig, "subject": subject})
    return rows


def raw_object(directory, index=1):
    sha = _git(directory, "log", "--reverse", "--format=%H").split()[index]
    return _git(directory, "cat-file", "-p", sha)


def trailer(directory):
    return _git(directory, "log", "-1", "--format=%(trailers)").strip()


def version():
    return _git(tempfile.mkdtemp(), "--version").strip().split()[-1]
