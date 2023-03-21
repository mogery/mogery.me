function generateSections() {
    [...document.getElementsByClassName("section")].map(x => {
        const children = [...x.children];
        if (children.length !== 1) return;

        const textElem = [...x.children][0];

        if (![...x.children].find(x => x.classList.contains("scrollsec"))) {
            for (let i = 0; i < 2; i++) {
                const scroll = document.createElement("div");
                scroll.className = "scrollsec";
                scroll.ariaHidden = "true";
                scroll.appendChild(textElem.cloneNode(true));
                x.appendChild(scroll);
            }
        }

        textElem.classList.add("sr-only");
    });

    [...document.getElementsByClassName("scrollsec")].map(x => {
        [...x.children].forEach(x => {
            if (x.classList.contains("clone")) {
                x.remove();
            }
        })
    
        const textElem = [...x.children][0];
        const idealCount = Math.floor(x.clientWidth / (textElem.clientWidth + 16));
    
        for (let i = 1; i < idealCount; i++) {
            const n = textElem.cloneNode(true);
            n.classList.add("clone");
            x.appendChild(n);
        }
    });
}

window.addEventListener("resize", generateSections);
generateSections();
