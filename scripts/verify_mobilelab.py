"""Exercise the actual TypeScript adapter against isolated SQLite, then restart."""
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import tempfile
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def verify():
    binary = os.environ.get('MOBILELAB_BIN') or shutil.which('mobilelab')
    if not binary:
        raise SystemExit('Install MobileLab 1.1.0 or set MOBILELAB_BIN.')
    binary = str(Path(binary).resolve())
    with tempfile.TemporaryDirectory(prefix='turno_mobilelab_') as directory:
        sandbox = Path(directory)
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            port = sock.getsockname()[1]
        config, count = re.subn(r'(?m)^(\s*port:\s*)\d+\s*$', rf'\g<1>{port}', (ROOT / 'mobilelab.yaml').read_text(), count=1)
        if count != 1:
            raise RuntimeError('Cannot configure isolated port')
        (sandbox / 'mobilelab.yaml').write_text(config)
        shutil.copytree(ROOT / 'mobilelab', sandbox / 'mobilelab', ignore=shutil.ignore_patterns('*.db*', '*.sqlite*', '.state.json', '*.log'))
        compiled = sandbox / 'compiled'
        subprocess.run(['node', 'node_modules/typescript/bin/tsc', '--project', 'tool/tsconfig.integration.json', '--outDir', str(compiled), '--rootDir', '.'], cwd=ROOT, check=True)
        base = f'http://127.0.0.1:{port}'

        def stop(process):
            if process and process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=5)

        def start(log):
            process = subprocess.Popen([binary, 'start', '--headless'], cwd=sandbox, stdout=log, stderr=subprocess.STDOUT)
            try:
                for _ in range(150):
                    if process.poll() is not None:
                        raise RuntimeError('MobileLab exited before readiness')
                    try:
                        with urllib.request.urlopen(base + '/api/shifts', timeout=1):
                            return process
                    except OSError:
                        time.sleep(0.1)
                raise RuntimeError('MobileLab readiness timeout')
            except BaseException:
                stop(process)
                raise

        process = None
        with open(sandbox / 'integration.log', 'w+') as log:
            try:
                process = start(log)
                subprocess.run(['node', str(compiled / 'tool/integration.js'), base, 'write'], cwd=ROOT, check=True)
                stop(process)
                process = start(log)
                subprocess.run(['node', str(compiled / 'tool/integration.js'), base, 'restart'], cwd=ROOT, check=True)
                print('Real HTTP adapter CRUD and SQLite persistence after restart: passed')
            except BaseException:
                log.flush()
                log.seek(0)
                print(log.read())
                raise
            finally:
                stop(process)


if __name__ == '__main__':
    verify()
