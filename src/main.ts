import MatMult from './mm';

// const canvas = document.getElementById('gfx') as HTMLCanvasElement;
// canvas.width = canvas.height = 640;
const renderer = new MatMult();
renderer.start();

console.log('test')

window.addEventListener('load', () => {
    renderer.computeButton.onclick = benchmark;
});

function yieldToBrowser() {
    return new Promise<void>(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, 0);
    });
}

async function setStatus(message) {
    renderer.statusMessage.textContent = message;
}

async function computeOnCPU(matrixA, matrixB, matrixDimension) {
    const resultArray = new ArrayBuffer(matrixA.length * 4);
    const result = new Float32Array(resultArray);

    const timeBefore = window.performance.now();
    await setStatus("Computing on the GPU");

    for (let resultX = 0; resultX < matrixDimension; resultX++) {
        for (let resultY = 0; resultY < matrixDimension; resultY++) {
            let sum = 0.0;

            for (let i = 0; i < matrixDimension; i++) {
                const aCell = i + resultX * matrixDimension;
                const bCell = resultY + i * matrixDimension;
                sum += matrixA[aCell] * matrixB[bCell];
            }

            const resultCell = resultY + resultX * matrixDimension;
            result[resultCell] = sum;
        }

        if (resultX % 10 === 0) {
            await setStatus("CPU computed row " + resultX);
        }
    }

    const elapsedTime = window.performance.now() - timeBefore;
    await setStatus("CPU finished");

    return [result, elapsedTime];
}

function randomFloats(elementCount) {
    const matrix = [];
    for (let i = 0; i < elementCount; i++) {
        matrix.push(Math.random() * 10);
    }
    return matrix;
}

async function benchmark() {
    let dimensionElement = document.getElementById("dimension") as HTMLInputElement;
    let matrixDimension = parseInt(dimensionElement.value);
    let matrixElements = matrixDimension * matrixDimension;
    if (matrixDimension > 2048) {
        alert("don't push it!");
        return;
    }

    document.getElementById("correctness").textContent = "";

    const matrixA = randomFloats(matrixElements);
    const matrixB = randomFloats(matrixElements);
    console.log(matrixA);
    console.log('matrixb', matrixB);

    let gpuTimes = [];
    let gpuResult: number | Float32Array;
    let gpuTime: number | Float32Array;
    for (let i = 0; i < 1; i++) {
        console.log(i);
        [gpuResult, gpuTime] = await renderer.computeOnGPU(
            matrixA,
            matrixB,
            matrixDimension
        );
        document.getElementById("gputime").textContent =
            (+gpuTime / 1000).toFixed(3) + "s";
        gpuTimes.push(gpuTime);
    }
    const average = arr => arr.reduce((acc,v) => acc + v) / arr.length;
    console.log((average(gpuTimes) / 1000).toFixed(3));

    let [cpuResult, cpuTime] = await computeOnCPU(
        matrixA,
        matrixB,
        matrixDimension
    );
    document.getElementById("cputime").textContent =
        (+cpuTime / 1000).toFixed(3) + "s";

    // return;

    await setStatus("Computing correctness");

    let correct = true;

    console.log('cpuResult', cpuResult)
    console.log('gpuResult', gpuResult)
    for (let i = 0; i < matrixElements; i++) {
        if (Math.abs(1.0 - gpuResult[i] / cpuResult[i]) > 0.00001) {
            correct = false;
        }
    }
    console.log('computing correctness')
    if (correct) {
        document.getElementById("correctness").textContent =
            "Computations match!";
    } else {
        document.getElementById("correctness").textContent =
            "Computations don't match (float addition issue?)";
    }
    await setStatus("Done");
}