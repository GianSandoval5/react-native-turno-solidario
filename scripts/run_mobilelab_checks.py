"""Install a pinned MobileLab CLI and run the project's real integration check."""
import hashlib
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import urllib.request

VERSION = "1.1.0"
SHA256 = "263305e2a0168d01af3334b5a62029e85bf0b319c20d343b35f4b3573459f953"
URL = f"https://github.com/GianSandoval5/MobileLab/releases/download/v{VERSION}/mobilelab-linux-amd64"


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    if not (root / "mobilelab.yaml").is_file():
        print("No MobileLab environment declared for this fixture.")
        return
    if not (root / "mobilelab/data.yaml").is_file() or not (root / "scripts/verify_mobilelab.py").is_file():
        raise SystemExit("MobileLab projects require data.yaml and scripts/verify_mobilelab.py")
    with tempfile.TemporaryDirectory(prefix="mobilelab_cli_") as directory:
        binary = Path(directory) / "mobilelab"
        request = urllib.request.Request(URL, headers={"User-Agent": "Mobile-AI-Factory-CI"})
        with urllib.request.urlopen(request, timeout=60) as response:
            binary.write_bytes(response.read())
        if hashlib.sha256(binary.read_bytes()).hexdigest() != SHA256:
            raise SystemExit("MobileLab binary checksum mismatch")
        binary.chmod(0o755)
        environment = dict(os.environ, MOBILELAB_BIN=str(binary))
        subprocess.run([sys.executable, "scripts/verify_mobilelab.py"], cwd=root, env=environment, check=True)


if __name__ == "__main__":
    main()
