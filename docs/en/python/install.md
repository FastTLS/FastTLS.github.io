# Python SDK installation

This guide covers published fastls 0.6.0 and its [GitHub Release](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.6.0). Platform wheels bundle the library; regular users need no Go, C compiler, source checkout, or separate DLL/dylib/so download.

The package and import name are fastls. Prefer [PyPI](https://pypi.org/project/fastls/0.6.0/):

```shell
python -m pip install --only-binary=:all: fastls==0.6.0
```

--only-binary=:all: rejects unsupported platforms instead of installing an SDK-only sdist without native code. Historical v0.1.2 used distribution fastls-ffi; its assets keep their names. Uninstall fastls-ffi before installing fastls, and vice versa, because they own the same import directory.

## 1. Interpreter and platform

Python 3.10+ is required. Choose for the **running Python interpreter's OS/architecture**, not the browser profile. A Linux wheel can still use chrome/156/windows.

```shell
python -c "import platform, struct, sys; print(sys.version); print(platform.system(), platform.machine(), struct.calcsize('P') * 8)"
```

Commands use python; substitute python3 on Linux/macOS if needed, or a correctly selected py -3 on Windows.

- Windows: 64-bit x86 Python, win_amd64. No Windows ARM64 wheel.
- Linux: manylinux_2_39_x86_64 or manylinux_2_39_aarch64. Certified for Ubuntu 24.04-compatible systems with glibc 2.39+, not every distribution. Alpine/musl is unsupported; ldd --version helps inspect glibc.
- macOS: macosx_15_0_x86_64 or macosx_15_0_arm64, both requiring macOS 15+. Rosetta/x86_64 Python on Apple Silicon needs the x86_64 wheel.

py3-none means ctypes C ABI rather than a CPython extension ABI. The wheel still contains platform-specific native code and is not portable across systems. See [packaging boundaries](https://github.com/FastTLS/fastls-ffi/blob/main/PACKAGING.md).

## 2. Virtual environments

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

Linux/macOS:

```shell
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

If PowerShell blocks activation scripts, invoke .venv\Scripts\python.exe directly; changing system execution policy is unnecessary.

## 3. Direct GitHub installation

Run only the command matching your interpreter.

### Windows x64

```shell
python -m pip install "https://github.com/FastTLS/fastls-ffi/releases/download/v0.6.0/fastls-0.6.0-py3-none-win_amd64.whl"
```

### Linux x64

```shell
python -m pip install "https://github.com/FastTLS/fastls-ffi/releases/download/v0.6.0/fastls-0.6.0-py3-none-manylinux_2_39_x86_64.whl"
```

### Linux ARM64

```shell
python -m pip install "https://github.com/FastTLS/fastls-ffi/releases/download/v0.6.0/fastls-0.6.0-py3-none-manylinux_2_39_aarch64.whl"
```

### macOS Intel, 15+

```shell
python -m pip install "https://github.com/FastTLS/fastls-ffi/releases/download/v0.6.0/fastls-0.6.0-py3-none-macosx_15_0_x86_64.whl"
```

### macOS Apple Silicon, 15+

```shell
python -m pip install "https://github.com/FastTLS/fastls-ffi/releases/download/v0.6.0/fastls-0.6.0-py3-none-macosx_15_0_arm64.whl"
```

Alternatively download a wheel from the release and install the local file, for example on Windows:

```shell
python -m pip install ./fastls-0.6.0-py3-none-win_amd64.whl
```

Do not rename wheels to bypass compatibility checks: names do not change architecture or system dependencies. Online installation requires access to GitHub's release download service.

## 4. Verify native loading

Check the installed version:

```shell
python -c "from importlib.metadata import version; print(version('fastls'))"
```

Expect 0.6.0. Then create a Session, load native code, and list profiles without internet access:

```python
from fastls import Session

with Session(profile="chrome/156/windows") as session:
    print(session.list_profiles())
```

Import alone is insufficient. See the [Python guide](index.md) for actual requests, streaming, and async calls.

## 5. Upgrade and remove

Use python -m pip install --upgrade --only-binary=:all: fastls for PyPI. For GitHub, select a release and matching wheel URL; the tag and filename versions must agree. To reinstall this release on Windows:

```shell
python -m pip install --force-reinstall "https://github.com/FastTLS/fastls-ffi/releases/download/v0.6.0/fastls-0.6.0-py3-none-win_amd64.whl"
```

Use the matching platform URL elsewhere. Restart the Python process or notebook kernel after upgrading so the old loaded library is not reused.

```shell
python -m pip uninstall fastls
```

## 6. Common errors

- **Unsupported wheel:** verify OS, interpreter architecture, and macOS minimum version. Use this environment's python -m pip; pip debug --verbose lists accepted tags.
- **ModuleNotFoundError:** installation and execution may use different interpreters. Compare python -m pip show fastls and sys.executable.
- **Missing/unloadable native library:** install a platform wheel, check system requirements, and remove stale FASTLS_LIBRARY/explicit library overrides that hide the bundle.
- **GLIBC symbol missing:** use a supported system/container or separately build and validate a library for your system. Renaming the wheel does not add old-glibc compatibility.
- **Download failure:** download the matching wheel on a machine with GitHub access and transfer it for local installation.

Loading order is explicit Session library → FASTLS_LIBRARY → wheel bundle → source dist/. Ordinary wheel users need no override.

## 7. Release assets and source installation

Users normally need only the matching .whl. SHA256SUMS records content hashes; build-info records source commits, toolchains, ABI, and library hashes; native-audit records native dependencies; release provenance records origin. Build-host metadata is not an exhaustive list of compatible systems.

The SDK-only .tar.gz neither includes nor downloads/builds native code. Provide a compatible ABI-v1 library with all current SDK capabilities. See [development instructions](https://github.com/FastTLS/fastls-ffi/blob/main/DEVELOPMENT.md).

## 8. PyPI publishing

0.6.0 includes five platform wheels and one SDK-only sdist. Formal v* tag workflows run all gates and use Trusted Publishing; ordinary branches, PRs, and development snapshots do not upload to PyPI. manylinux_2_39 requires glibc 2.39+, not musl. See [maintainer notes](https://github.com/FastTLS/fastls-ffi/blob/main/PYPI.md), [PyPI publisher setup](https://docs.pypi.org/trusted-publishers/creating-a-project-through-oidc/), and [GitHub publishing](https://docs.pypi.org/trusted-publishers/using-a-publisher/).


---

Source: [FastTLS/fastls-ffi · INSTALL.md](https://github.com/FastTLS/fastls-ffi/blob/84a568d35f4680eb7b8b5425d898d33c8eaecf2f/INSTALL.md). Reviewed 2026-10-30.

Python 0.4.0 / Node 0.13.0 add shared offline JA3/H2 conversion and a manual browser candidate workflow. See [formats, examples and limits](../reference/browser-profiles.md).
