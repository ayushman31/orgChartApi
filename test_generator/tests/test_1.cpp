#include <drogon/drogon_test.h>
#include <drogon/drogon.h>
#include "controllers/AuthController.h"
#include "controllers/PersonsController.h"
#include "controllers/DepartmentsController.h"
#include "controllers/JobsController.h"

DROGON_TEST(AuthController_RegisterUser_Success)
{
    Json::Value userJson;
    userJson["username"] = "testuser";
    userJson["password"] = "testpass";

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

DROGON_TEST(AuthController_Login_Success)
{
    Json::Value userJson;
    userJson["username"] = "testuser";
    userJson["password"] = "testpass";

    auto req = drogon::HttpRequest::newHttpJsonRequest(userJson);
    std::promise<drogon::HttpResponsePtr> promise;
    auto future = promise.get_future();

    AuthController controller;
    controller.login(req, [&](const drogon::HttpResponsePtr& resp) {
        promise.set_value(resp);
    }, User(userJson));

    auto resp = future.get();
    REQUIRE(resp->getStatusCode() == drogon::k200OK);
}

DROGON_TEST(AuthController_RegisterUser_InvalidUsername)
{
    Json::Value userJson;
    userJson["username"] = "";
    userJson["password"] = "testpass";

    auto req = drogon::HttpRequest::newHttpJsonRequest(userJson);
    std::promise<drogon::HttpResponsePtr> promise;
    auto future = promise.get_future();

    AuthController controller;
    controller.registerUser(req, [&](const drogon::HttpResponsePtr& resp) {
        promise.set_value(resp);
    }, User(userJson));

    auto resp = future.get();
    REQUIRE(resp->getStatusCode() != drogon::k201Created);
}

// Continue this pattern for other controllers and their methods.