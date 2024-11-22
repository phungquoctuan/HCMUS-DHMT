function createShader(gl, type, source) {
    // Tạo shader với loại và mã nguồn được cung cấp
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    // In ra lỗi nếu shader không được biên dịch thành công
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    // Tạo chương trình và gắn các shader vào
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    // In ra lỗi nếu chương trình không được liên kết thành công
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function verticesToBuffer(vertices) {
    // Tạo một bộ đệm trống để lưu trữ bộ đệm đỉnh
    var vertex_buffer = gl.createBuffer();

    // Gắn bộ đệm mảng thích hợp vào
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // Truyền dữ liệu đỉnh vào bộ đệm
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Hủy gắn bộ đệm
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vertex_buffer;
}

function sendBufferToProgram(program, buffer) {
    // Gắn bộ đệm đỉnh
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Lấy vị trí thuộc tính
    var coord = gl.getAttribLocation(program, "coordinates");

    // Trỏ thuộc tính đến VBO hiện tại
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

    // Kích hoạt thuộc tính
    gl.enableVertexAttribArray(coord);
}

function clearGL(color, top, left, width, height) {
    // Xóa canvas
    gl.clearColor(...color);

    // Kích hoạt kiểm tra độ sâu
    gl.enable(gl.DEPTH_TEST);

    // Xóa bộ đệm màu
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Đặt khung nhìn
    gl.viewport(top, left, width, height);
}

// additional codes ------------------------------------------------------------------------------------------------
function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    console.log("Coordinate x: " + x,
        "Coordinate y: " + y);
}

function drawLine(e) {
    // Lấy phần tử canvas từ DOM
    var canvas = document.getElementById('gl_Canvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    // Xóa canvas và thiết lập khung nhìn
    clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

    // Vertex data
    var vertices = [];

    // additional codes
    let canvasElem = document.querySelector("canvas");

    canvasElem.addEventListener("mousedown", function (e) {
        let rect = canvasElem.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / canvas.width) * 2 - 1;
        let y = ((e.clientY - rect.top) / canvas.height) * -2 + 1;
        vertices.push(x, y, 0.0);

        if (vertices.length >= 6) {
            // Tạo bộ đệm đỉnh từ các đỉnh
            var vertex_buffer = verticesToBuffer(vertices);

            // Mã nguồn của vertex shader
            var vertCode =
                'attribute vec3 coordinates;' +
                'void main(void) {' +
                ' gl_Position = vec4(coordinates, 1.0);' +
                'gl_PointSize = 10.0;' +
                '}';

            // Mã nguồn của fragment shader
            var fragCode =
                'void main(void) {' +
                ' gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' +
                '}';

            // Tạo và biên dịch vertex shader
            var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertCode);

            // Tạo và biên dịch fragment shader
            var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragCode);

            // Tạo chương trình và gắn các shader vào
            var program = createProgram(gl, vertexShader, fragmentShader);

            // Sử dụng chương trình
            gl.useProgram(program);

            // Gửi bộ đệm đỉnh vào chương trình
            sendBufferToProgram(program, vertex_buffer);

            // Xóa canvas và thiết lập khung nhìn
            clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

            // Vẽ hình tam giác
            gl.drawArrays(gl.POINTS, 0, vertices.length / 3); // draw points
            gl.drawArrays(gl.LINES, 0, vertices.length / 3); // draw lines
            console.log(vertices);
        }
    });
}

function drawEllipse(e) {
    // Lấy phần tử canvas từ DOM
    var canvas = document.getElementById('gl_Canvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    // Xóa canvas và thiết lập khung nhìn
    clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

    // Vertex data
    // var vertices = [];
    const vertices = [];

    // additional codes
    let canvasElem = document.querySelector("canvas");

    canvasElem.addEventListener("mousedown", function (e) {
        let rect = canvasElem.getBoundingClientRect();
        let centerX = ((e.clientX - rect.left) / canvas.width) * 2 - 1;
        let centerY = ((e.clientY - rect.top) / canvas.height) * -2 + 1;
        console.log(centerX, centerY);
        const a = prompt("Enter semi-major axis (horizontal radius [-1.0,..,1.0]:");
        const b = prompt("Enter semi-minor axis (vertical radius) [-1.0,..,1.0] :");

        // while (a > 1 || b > 1) {
        //     alert("Semi-major axis and semi-minor axis must be less than 1");
        //     const a = prompt("Enter semi-major axis (horizontal radius):");
        //     const b = prompt("Enter semi-minor axis (vertical radius):");
        // }
        // START CORE CODE ------------------------------------------------------------------------------------------------
        // const a2 = a * a;
        // const b2 = b * b;
        // let x = 0;
        // let y = b;
        // let p = b2 - a2 * b + a2 / 4;

        // // const vertices = [];

        // // First quadrant
        // while (2 * b2 * x < 2 * a2 * y) {
        //     vertices.push((x + centerX) / canvas.width * 2 - 1, (y + centerY) / canvas.height * -2 + 1);
        //     vertices.push((-x + centerX) / canvas.width * 2 - 1, (y + centerY) / canvas.height * -2 + 1);
        //     vertices.push((x + centerX) / canvas.width * 2 - 1, (-y + centerY) / canvas.height * -2 + 1);
        //     vertices.push((-x + centerX) / canvas.width * 2 - 1, (-y + centerY) / canvas.height * -2 + 1);

        //     x++;
        //     if (p < 0) {
        //         p += 2 * b2 * x + b2;
        //     } else {
        //         p += 2 * b2 * x - 2 * a2 * y + b2;
        //         y--;
        //     }
        // }

        // // Second quadrant
        // while (y >= 0) {
        //     vertices.push((x + centerX) / canvas.width * 2 - 1, (y + centerY) / canvas.height * -2 + 1);
        //     vertices.push((-x + centerX) / canvas.width * 2 - 1, (y + centerY) / canvas.height * -2 + 1);
        //     vertices.push((x + centerX) / canvas.width * 2 - 1, (-y + centerY) / canvas.height * -2 + 1);
        //     vertices.push((-x + centerX) / canvas.width * 2 - 1, (-y + centerY) / canvas.height * -2 + 1);

        //     y--;
        //     if (p > 0) {
        //         p += -2 * a2 * y + a2;
        //     } else {
        //         p += 2 * b2 * x - 2 * a2 * y + a2;
        //         x++;
        //     }
        // }



        const numSegments = 400; // Number of segments to approximate the ellipse

        for (let i = 0; i <= numSegments; i++) {
            const theta = i * 2 * Math.PI / numSegments;
            const x = centerX + a * Math.cos(theta);
            const y = centerY + b * Math.sin(theta);
            vertices.push(x, y, 0.0);
        }
        // END CORE CODE --------------------------------------------------------------------------------------------------

        if (vertices.length >= 6) {
            // Tạo bộ đệm đỉnh từ các đỉnh
            var vertex_buffer = verticesToBuffer(vertices);
            console.log("Vertices:", vertices);
            // Mã nguồn của vertex shader
            var vertCode =
                'attribute vec3 coordinates;' +
                'void main(void) {' +
                ' gl_Position = vec4(coordinates, 1.0);' +
                'gl_PointSize = 4.0;' +
                '}';

            // Mã nguồn của fragment shader
            var fragCode =
                'void main(void) {' +
                ' gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' +
                '}';

            // Tạo và biên dịch vertex shader
            var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertCode);

            // Tạo và biên dịch fragment shader
            var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragCode);

            // Tạo chương trình và gắn các shader vào
            var program = createProgram(gl, vertexShader, fragmentShader);

            // Sử dụng chương trình
            gl.useProgram(program);

            // Gửi bộ đệm đỉnh vào chương trình
            sendBufferToProgram(program, vertex_buffer);

            // Xóa canvas và thiết lập khung nhìn
            clearGL([0, 0, 0, 1], 0, 0, canvas.width, canvas.height);

            // Vẽ hình tam giác
            gl.drawArrays(gl.POINTS, 0, vertices.length / 3); // draw points
            //    gl.drawArrays(gl.LINES, 0, vertices.length / 3); // draw lines
            console.log(vertices);
        }
    });
}

// main ------------------------------------------------------------------------------------------------------------
function main() {
    drawLine(); // uncomment this line to draw line
    // drawEllipse(); // uncomment this line to draw ellipse
}

// gọi hàm main
main();
