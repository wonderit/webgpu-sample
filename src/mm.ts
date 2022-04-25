import mmCode from './shaders/matrix.multiplication.wgsl';

export default class MatMult {
    // ⚙️ API Data Structures
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    // 🎞️ Frame Backings
    computeButton:HTMLButtonElement;
    statusMessage: HTMLSpanElement;
    mmModule: GPUShaderModule;
    computePipeline: GPUComputePipeline;
    bindGroup: GPUBindGroup;

    commandEncoder: GPUCommandEncoder;
    passEncoder: GPUComputePassEncoder;

    constructor() {
    }

    // 🏎️ Start the rendering engine
    async start() {
        if (await this.initializeAPI()) {
            this.render();
        }
    }

    // 🌟 Initialize WebGPU
    async initializeAPI(): Promise<boolean> {
        try {
            // 🏭 Entry to WebGPU
            const entry: GPU = navigator.gpu;
            if (!entry) {
                return false;
            }

            // 🔌 Physical Device Adapter
            this.adapter = await entry.requestAdapter();

            // 💻 Logical Device
            this.device = await this.adapter.requestDevice();

            // 📦 Queue
            this.queue = this.device.queue;
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }

    // 🍱 Initialize resources to render triangle (buffers, shaders, pipeline)
    async initializeResources() {
        // 🖍️ Shaders
        const mmDesc = {
            code: mmCode
        };
        this.mmModule = this.device.createShaderModule(mmDesc);

    }

    async computeOnGPU(matrixA, matrixB, matrixDimension) {

        await this.setStatus("Preparing for the GPU");
        await this.initializeResources();

        // Slide 1: Initialize WebGPU
        // const adapter = await navigator.gpu.requestAdapter();
        // const device = await adapter.requestDevice();

        // Slide 2: Allocate memory for the matrix data.
        const matrixSize = matrixDimension * matrixDimension * 4; // sizeof(float) == 4

        const gpuMatrixA = this.device.createBuffer({
            size: matrixSize,
            usage: GPUBufferUsage.STORAGE,
            mappedAtCreation: true
        });

        new Float32Array(gpuMatrixA.getMappedRange()).set(matrixA);
        gpuMatrixA.unmap();

        const gpuMatrixB = this.device.createBuffer({
            size: matrixSize,
            usage: GPUBufferUsage.STORAGE,
            mappedAtCreation: true
        });

        new Float32Array(gpuMatrixB.getMappedRange()).set(matrixB);
        gpuMatrixB.unmap();

        const gpuMatrixC = this.device.createBuffer({
            size: matrixSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });



        // Slide 4b: Compile the GPU program.
        this.computePipeline = this.device.createComputePipeline({
            compute: {
                module: this.mmModule,
                entryPoint: "main"
            }
        });

        // Slide 3: Create the data “group”.
        this.bindGroup = this.device.createBindGroup({
            layout: this.computePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: gpuMatrixA } },
                { binding: 1, resource: { buffer: gpuMatrixB } },
                { binding: 2, resource: { buffer: gpuMatrixC } }
            ]
        });

        // Slide 5: Encode the compute commands.
        this.commandEncoder = this.device.createCommandEncoder();

        this.passEncoder = this.commandEncoder.beginComputePass();
        this.passEncoder.setPipeline(this.computePipeline);
        this.passEncoder.setBindGroup(0, this.bindGroup);
        this.passEncoder.dispatch(
            Math.ceil(matrixDimension / 8),
            Math.ceil(matrixDimension / 8)
        );
        this.passEncoder.end();

        // Slide 6: Encode the readback commands.
        const gpuReadBuffer = this.device.createBuffer({
            size: matrixSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });

        this.commandEncoder.copyBufferToBuffer(
            gpuMatrixC,
            0,
            gpuReadBuffer,
            0,
            matrixSize
        );

        // Slide 7: Submit work to the GPU.
        await this.setStatus("Computing on the GPU");
        const timeBefore = window.performance.now();

        const gpuCommands = this.commandEncoder.finish();
        this.device.queue.submit([gpuCommands]);

        await gpuReadBuffer.mapAsync(GPUMapMode.READ);
        const cpuMatrixC = gpuReadBuffer.getMappedRange();

        const elapsedTime = window.performance.now() - timeBefore;
        await this.setStatus("GPU finished");

        const resultArray = new ArrayBuffer(cpuMatrixC.byteLength);
        const result = new Float32Array(resultArray);
        result.set(new Float32Array(cpuMatrixC));

        return [result, elapsedTime];
    }

    async setStatus(message) {
        this.statusMessage.textContent = message;
        // await yieldToBrowser();
    }

    render = () => {
        this.computeButton = document.getElementById('benchmark') as HTMLButtonElement;
        this.statusMessage = document.getElementById('status') as HTMLSpanElement;

            // ⏭ Acquire next image from context
        // this.results = { }

        console.log('render')
    };
}
