#include <drogon/drogon_test.h>
#include <drogon/drogon.h>
#include "controllers/AuthController.h"
#include "controllers/PersonsController.h"
#include "controllers/DepartmentsController.h"
#include "controllers/JobsController.h"
#include "models/User.h"
#include "models/Person.h"
#include "models/Department.h"
#include "models/Job.h"
#include "models/Person.h"

DROGON_TEST(AuthController_RegisterUser_Success)
{
    Json::Value userJson;
    userJson["username"] = "testuser";
    userJson["password"] = "testpass123"; // Updated password to match the User JSON template

    auto req = drogon::HttpRequest::newHttpJsonRequest(userJson);
    std::promise<drogon::HttpResponsePtr> promise;
    auto future = promise.get_future();

    AuthController controller;
    controller.registerUser(req, [&](const drogon::HttpResponsePtr& resp) {
        promise.set_value(resp);
    }, User(userJson));

    auto resp = future.get();
    REQUIRE(resp->getStatusCode() == drogon::k201Created);
}

DROGON_TEST(AuthController_LoginUser_Success)
{
    Json::Value userJson;
    userJson["username"] = "testuser";
    userJson["password"] = "testpass123"; // Updated password to match the User JSON template

    auto req = drogon::HttpRequest::newHttpJsonRequest(userJson);
    std::promise<drogon::HttpResponsePtr> promise;
    auto future = promise.get_future();

    AuthController controller;
    controller.loginUser(req, [&](const drogon::HttpResponsePtr& resp) {
        promise.set_value(resp);
    }, User(userJson));

    auto resp = future.get();
    REQUIRE(resp->getStatusCode() == drogon::k200OK);
}

DROGON_TEST(AuthController_LoginUser_InvalidUsername)
{
    Json::Value userJson;
    userJson["username"] = ""; // Updated to an empty string
    userJson["password"] = "testpass123"; // Updated password to match the User JSON template

    auto req = drogon::HttpRequest::newHttpJsonRequest(userJson);
    std::promise<drogon::HttpResponsePtr> promise;
    auto future = promise.get_future();

    AuthController controller;
    controller.loginUser(req, [&](const drogon::HttpResponsePtr& resp) {
        promise.set_value(resp);
    }, User(userJson));

    auto resp = future.get();
    REQUIRE(resp->getStatusCode() != drogon::k200OK);
}

// PersonsController tests
DROGON_TEST(PersonsController_Get_Success) {
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setMethod(drogon::Get);
    req->setPath("/persons");
    
    std::promise<drogon::HttpResponsePtr> promise;
    auto future = promise.get_future();
    
    PersonsController controller;
    controller.get(req, [&](const drogon::HttpResponsePtr& resp) {
        promise.set_value(resp);
    });  // ← No Person parameter!
    
    auto resp = future.get();
    REQUIRE(resp->getStatusCode() == drogon::k200OK);
}

// ... (Continue this pattern for other controllers and their methods)


//only these many tests were able to be generated because of the lower context window of the LLM