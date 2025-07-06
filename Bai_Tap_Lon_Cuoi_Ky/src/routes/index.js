const homeRouter = require("./home");
const loginRouter = require("./login");
const dashboardRouter = require("./dashboard");

function route(app) {
    // API routes  

    // Web routes
    app.use("/login", loginRouter);
    app.use("/dashboard", dashboardRouter);
    app.use("/", homeRouter);
}

module.exports = route;