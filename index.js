const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const { marked } = require("marked");

console.log("mogery.me generator");

const resourcesDir = path.join(__dirname, "resources/");
const templatesDir = path.join(__dirname, "templates/");
const blogDir = path.join(__dirname, "blog/");
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
const blogPosts = Object.entries(loadDir(blogDir))
    .map(([filename, content]) => {
        let title = "Untitled";
        let image = "";
        let description = "";

        content = content.replace(/```(.+?)```/s, (_, x) => {
            const obj = JSON.parse(x);
            title = obj.title || "Untitled";
            image = obj.image || "";
            description = obj.description || "";

            return "";
        });

        let tok = path.basename(filename, path.extname(filename)).split("-");
        let dateStr = tok[0];
        
        let date = new Date(
            dateStr.slice(0, 4),
            parseInt(dateStr.slice(4, 6), 10) - 1,
            dateStr.slice(6, 8),
            dateStr.slice(8, 10),
            dateStr.slice(10, 12),
            dateStr.slice(12, 14),
        );
        let urlname = tok.slice(1).join("-");
        
        return {
            urlname,
            d: date,
            date: `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}.`,
            image,
            title,
            description,
            html: marked.parse(content),
        }
    })
    .sort((a,b) => b.d - a.d);

console.log(blogPosts);

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
Handlebars.registerHelper("json", x => {
    return JSON.stringify(JSON.stringify(x));
});

function generateHTML(name) {
    return templates[name]({
        blog: blogPosts,
    });
}

fs.writeFileSync(path.join(distDir, "index.html"), generateHTML("index.html"));

function generateBlogPost(post) {
    return templates["blogpost.html"]({
        post
    });
}

fs.cpSync(staticDir, distDir, { recursive: true });

if (!fs.existsSync(path.join(distDir, "blog"))) {
    fs.mkdirSync(path.join(distDir, "blog"));
}

fs.writeFileSync(path.join(distDir, "blog", "index.html"), generateHTML("blog.html"));

for (const post of blogPosts) {
    if (!fs.existsSync(path.join(distDir, "blog", post.urlname))) {
        fs.mkdirSync(path.join(distDir, "blog", post.urlname));
    }
    fs.writeFileSync(path.join(distDir, "blog", post.urlname, "index.html"), generateBlogPost(post));
}
