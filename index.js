const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

console.log("mogery.me generator");

const resourcesDir = path.join(__dirname, "resources/");
const templatesDir = path.join(__dirname, "templates/");
const staticDir = path.join(__dirname, "static/");
const distDir = path.join(__dirname, "dist/");

if (fs.existsSync(distDir)) {
    fs.rmdirSync(distDir, { recursive: true });
}

fs.mkdirSync(distDir);

function loadDir(dir, transformer = (x => x)) {
    return Object.fromEntries(
        fs.readdirSync(dir)
            .map(x => [
                x,
                transformer(fs.readFileSync(path.join(dir, x), "utf8")),
            ]),
    );
}

const resources = loadDir(resourcesDir);
const templates = loadDir(templatesDir, x => Handlebars.compile(x));

function generateResourceHTML(name) {
    const res = resources[name];
    const ext = path.extname(name);

    if (ext === ".css") {
        return "<style>" + res + "</style>";
    } else if (ext === ".js") {
        return "<script>" + res + "</script>";
    } else {
        throw new Error("Unknown resource extension " + ext + " (" + name + ")");
    }
}

Handlebars.registerHelper("resource", generateResourceHTML);

function generateHTML(name) {
    return templates[name]({});
}

fs.writeFileSync(path.join(distDir, "index.html"), generateHTML("index.html"));

fs.readdirSync(staticDir).forEach(file => {
    fs.copyFileSync(path.join(staticDir, file), path.join(distDir, file));
});
