 Based on the provided build log, it appears that the project is trying to find OpenSSL but cannot locate its root directory. Here's a solution where I assume you have the OpenSSL library installed and accessible in your system environment. If not, please follow the steps to install it first.

In your `CMakeLists.txt` file, add the following lines:

```cmake
find_package(OpenSSL REQUIRED)
```

If you have installed OpenSSL in a custom directory, set the `OPENSSL_ROOT_DIR` variable accordingly:

```cmake
set(OPENSSL_ROOT_DIR "path/to/your/OpenSSL")
find_package(OpenSSL REQUIRED)
```

If the above steps don't work and you have the OpenSSL library files, include the necessary paths manually:

```cmake
set(OPENSSL_CRYPTO_LIBRARY "path/to/your/libcrypto.lib")
set(OPENSSL_INCLUDE_DIR "path/to/your/include")
find_package(OpenSSL REQUIRED)
```