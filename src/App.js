import React from 'react';


function App() {
    const canvasRef = React.useRef(null);
    const contextRef = React.useRef(null);
    const crossDots = React.useRef(null);
    let startDot = React.useRef(null);
    const lines = React.useRef(null);

    const canvasWidth = 800;
    const canvasHeight = 500;


    let [isDrawing, setIsDrawing] = React.useState(false);

    let dots = {x: 0, y: 0};
    let tempDots = [];

    let currentPosition = {
        collapsed: false,
        startX: 0, startY: 0, endX: 0, endY: 0,
        getCenter() {
            return [Math.round((this.startX + this.endX) / 2), Math.round((this.startY + this.endY) / 2)]
        }
    };


    React.useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const context = canvas.getContext("2d");


        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 5;
        context.fillStyle = "red";
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 5;
        contextRef.current = context;
        lines.current = [];
        crossDots.current = [];
        startDot.current = {x: 0, y: 0};


    }, []);


    const clear = React.useCallback(() => {
        contextRef.current.beginPath();
        contextRef.current.clearRect(0, 0, canvasWidth, canvasHeight);
    }, []);


    const drawOld = () => {
        lines.current.forEach((line) => {
            if (line) {
                if (line.collapsed) {
                    let [x, y] = line.getCenter();
                    contextRef.current.beginPath();
                    contextRef.current.moveTo(x, y);
                    contextRef.current.lineTo(x, y);
                    contextRef.current.stroke();
                } else {
                    contextRef.current.beginPath();
                    contextRef.current.moveTo(line.startX, line.startY);
                    contextRef.current.lineTo(line.endX, line.endY);
                    contextRef.current.stroke();

                    crossDots.current.forEach((dot => {
                        if (dot) {
                            if (Array.isArray(dot)) {
                                dot.forEach((d) => {
                                    contextRef.current.fillRect(d.x - 4, d.y - 4, 8, 8)
                                })
                            } else {
                                contextRef.current.fillRect(dot.x - 4, dot.y - 4, 8, 8);
                            }
                        }


                    }))

                }

            }

        });

    };

    const startDrawing = (e) => {
        setIsDrawing(isDrawing = !isDrawing);
        contextRef.current.beginPath();
        if (lines.current.length > 1) drawOld();

        if (isDrawing) {
            startDot.current.x = e.clientX;
            startDot.current.y = e.clientY;
        }
        else {
            lines.current.push({...currentPosition});

            if (lines.current.length > 1) {
                crossDots.current.push(...tempDots.slice(-lines.current.length));

            }

            checkCrossForAll();
        }
    };

    let continueDrawing = (e) => {
        contextRef.current.beginPath();
        currentPosition.startX = startDot.current.x;
        currentPosition.startY = startDot.current.y;
        currentPosition.endX = e.clientX;
        currentPosition.endY = e.clientY;
        clear();
        contextRef.current.moveTo(currentPosition.startX, currentPosition.startY);
        contextRef.current.lineTo(e.clientX, e.clientY);
        contextRef.current.stroke();
        drawOld();
        checkCrossForAll();
    };


    const VEK = (ax, ay, bx, by) => {
        return ax * by - bx * ay;
    };


    const crossingCheck = (x1, y1, x2, y2, x3, y3, x4, y4) => {

        let v1, v2, v3, v4;

        v1 = VEK(x4 - x3, y4 - y3, x1 - x3, y1 - y3);
        v2 = VEK(x4 - x3, y4 - y3, x2 - x3, y2 - y3);
        v3 = VEK(x2 - x1, y2 - y1, x3 - x1, y3 - y1);
        v4 = VEK(x2 - x1, y2 - y1, x4 - x1, y4 - y1);
        if (v1 * v2 < 0 && v3 * v4 < 0) return true;
        else return false;
    };


    const equationOfTheLine = (x1, y1, x2, y2) => {
        let A, B, C;
        A = y2 - y1;
        B = x1 - x2;
        C = -x1 * (y2 - y1) + y1 * (x2 - x1);
        return [A, B, C];
    };

    const intersectionX = (a1, b1, c1, a2, b2, c2) => {
        let d, dx, pointx;
        d = a1 * b2 - b1 * a2;
        dx = -c1 * b2 + b1 * c2;
        pointx = dx / d;
        return pointx;
    };

    const intersectionY = (a1, b1, c1, a2, b2, c2) => {
        let d, dy, pointy;
        d = a1 * b2 - b1 * a2;
        dy = -a1 * c2 + c1 * a2;
        pointy = dy / d;
        return pointy;
    };

    const tempCheck = (x1, y1, x2, y2, x3, y3, x4, y4) => {
        if (crossingCheck(x1, y1, x2, y2, x3, y3, x4, y4)) {
            let [a1, b1, c1] = equationOfTheLine(x1, y1, x2, y2);
            let [a2, b2, c2] = equationOfTheLine(x3, y3, x4, y4);
            dots.x = intersectionX(a1, b1, c1, a2, b2, c2);
            dots.y = intersectionY(a1, b1, c1, a2, b2, c2);
            contextRef.current.fillRect(dots.x - 4, dots.y - 4, 8, 8);
            tempDots.push({...dots});

        } else {
            return null;
        }
    };

    const checkCrossForAll = () => {
        lines.current.forEach((line) => {
            tempCheck(line.startX, line.startY, line.endX, line.endY, currentPosition.startX, currentPosition.startY, currentPosition.endX, currentPosition.endY);

        })
    };


    const cancelDrawing = (e) => {
        e && e.preventDefault();
        clear();
        drawOld();

        setIsDrawing(false);
    };

    const sleep = (ms) => {

        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    };


    const getSecondDot = (x, A, B, C) => {
        let y;
        y = -(A / B) * x - C / B;
        return y;

    };

    async function lineToCentr() {
        for (let line of lines.current) {
            if (line.collapsed) return;
            let [x] = line.getCenter();
            let ax = Math.round(line.startX);
            let bx = Math.round(line.endX);
            let [a1, b1, c1] = equationOfTheLine(line.startX, line.startY, line.endX, line.endY);
            line.collapsed = true;

            let timer = setInterval(() => {
                if (ax > x) {
                    clearInterval(timer);
                    clear();
                    drawOld();
                    return;
                }

                clear();
                drawOld();

                contextRef.current.moveTo(ax, getSecondDot(ax, a1, b1, c1));
                contextRef.current.lineTo(bx, getSecondDot(bx, a1, b1, c1));
                contextRef.current.stroke();

                ax += 1;
                bx -= 1;

            }, 16);
            await sleep(3000);

        }


    }

    return (
        <div className="wrapper">
            <canvas
                style={{border: "2px solid red"}}
                onClick={startDrawing}
                onContextMenu={cancelDrawing}
                onMouseMove={isDrawing ? continueDrawing : null}
                ref={canvasRef}
            />
            <button onClick={lineToCentr}>Collapse</button>
        </div>
    );
}

export default App;
