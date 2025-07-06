const homeRouter = require("./home");
const loginRouter = require("./login");
const dashboardRouter = require("./dashboard");
const apiRouter = require("./api");

function route(app) {
    // API routes  
    app.use("/api", apiRouter);

    // Web routes
    app.use("/login", loginRouter);
    app.use("/dashboard", dashboardRouter);
    app.use("/", homeRouter);
}

module.exports = route;