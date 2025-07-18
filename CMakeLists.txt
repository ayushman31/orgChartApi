cmake_minimum_required(VERSION 3.10)
project(org_chart CXX)

include(CheckIncludeFileCXX)

set(OPENSSL_ROOT_DIR "C:/Program Files/OpenSSL-Win64")
find_package(OpenSSL REQUIRED)

check_include_file_cxx(any HAS_ANY)
check_include_file_cxx(string_view HAS_STRING_VIEW)
check_include_file_cxx(coroutine HAS_COROUTINE)
if (NOT "${CMAKE_CXX_STANDARD}" STREQUAL "")
    # Do nothing
elseif (HAS_ANY AND HAS_STRING_VIEW AND HAS_COROUTINE)
    set(CMAKE_CXX_STANDARD 20)
elseif (HAS_ANY AND HAS_STRING_VIEW)
    set(CMAKE_CXX_STANDARD 17)
else ()
    set(CMAKE_CXX_STANDARD 14)
endif ()

set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# ============================================================================
# Add bundled third-party libraries BEFORE drogon
# ============================================================================

# Add jsoncpp from third_party
add_subdirectory(third_party/jsoncpp)

# Add jwt-cpp
add_subdirectory(third_party/jwt-cpp)

# Add libbcrypt  
add_subdirectory(third_party/libbcrypt)

# Add drogon (which will now find the jsoncpp we just added)
add_subdirectory(third_party/drogon)

# ============================================================================
# Main executable
# ============================================================================

add_executable(${PROJECT_NAME} main.cc)

# Link libraries
target_link_libraries(${PROJECT_NAME} PRIVATE 
    drogon
    jsoncpp_lib          # ← Add jsoncpp explicitly
    jwt-cpp
    bcrypt
)

# Comment out the find_package line since we're using bundled drogon
find_package(Drogon CONFIG REQUIRED)
target_link_libraries(${PROJECT_NAME} PRIVATE Drogon::Drogon)

# ============================================================================
# C++ Standard support
# ============================================================================

if (CMAKE_CXX_STANDARD LESS 17)
    message(STATUS "use c++14")
    find_package(Boost 1.61.0 REQUIRED)
    target_link_libraries(${PROJECT_NAME} PUBLIC Boost::boost)
elseif (CMAKE_CXX_STANDARD LESS 20)
    message(STATUS "use c++17")
else ()
    message(STATUS "use c++20")
endif ()

# ============================================================================
# Source files
# ============================================================================

aux_source_directory(controllers CTL_SRC)
aux_source_directory(filters FILTER_SRC)
aux_source_directory(plugins PLUGIN_SRC)
aux_source_directory(models MODEL_SRC)
aux_source_directory(utils UTIL_SRC)

target_include_directories(${PROJECT_NAME}
                           PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}
                                   ${CMAKE_CURRENT_SOURCE_DIR}/models)
target_sources(${PROJECT_NAME}
               PRIVATE
               ${SRC_DIR}
               ${CTL_SRC}
               ${FILTER_SRC}
               ${PLUGIN_SRC}
               ${MODEL_SRC}
               ${UTIL_SRC})

# ============================================================================
# Tests
# ============================================================================

add_subdirectory(test)
