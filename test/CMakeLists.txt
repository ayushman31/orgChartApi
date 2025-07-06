cmake_minimum_required(VERSION 3.10)
project(org_chart_test CXX)

# Add all source files that the tests need
add_executable(${PROJECT_NAME} 
    test_main.cc 
    test_controllers.cc
    test_generated.cc
    # Add the actual source files being tested
    ../controllers/AuthController.cc
    ../controllers/PersonsController.cc
    ../controllers/DepartmentsController.cc
    ../controllers/JobsController.cc
    ../models/User.cc
    ../models/Person.cc
    ../models/Department.cc
    ../models/Job.cc
    ../models/PersonInfo.cc
    ../filters/LoginFilter.cc
    ../plugins/Jwt.cc
    ../plugins/JwtPlugin.cc
    ../utils/utils.cc
)

target_link_libraries(${PROJECT_NAME} PRIVATE drogon)

target_include_directories(${PROJECT_NAME} PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}/..
    ${CMAKE_CURRENT_SOURCE_DIR}/../controllers
    ${CMAKE_CURRENT_SOURCE_DIR}/../models
    ${CMAKE_CURRENT_SOURCE_DIR}/../filters
    ${CMAKE_CURRENT_SOURCE_DIR}/../plugins
    ${CMAKE_CURRENT_SOURCE_DIR}/../utils
)

ParseAndAddDrogonTests(${PROJECT_NAME})
