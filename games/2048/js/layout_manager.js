function resizeLayout() {
    const container = document.getElementsByClassName("container")?.[0];
    if (!container) return;

    rescale(container);
}
function rescale(container) {
    const margin = 5;
    const expectedWidth = window.innerWidth - margin - margin;
    const expectedHeight = window.innerHeight - margin - margin;
    const scX = expectedWidth / container.clientWidth;
    const scY = expectedHeight / container.clientHeight;
    const minSc = Math.min(scX, scY);
    
    let scale = `scale(${minSc}, ${minSc})`;
    let translate;
    let offsetY = 0, offsetX = 0;
    offsetY = (window.innerHeight - container.clientHeight) * 0.5 / minSc - margin * 3;
    if (expectedWidth < container.clientWidth) {
        offsetX = (container.clientWidth - expectedWidth - margin*2) / 2 / minSc;
    }
    translate = `translate(${-offsetX}px,${offsetY}px)`;

    const transform = scale + ' ' + translate;
    container.style.transform = transform;
}

window.addEventListener("resize", ()=>{
    resizeLayout();
    setTimeout(resizeLayout, 500);
}, false);
resizeLayout();