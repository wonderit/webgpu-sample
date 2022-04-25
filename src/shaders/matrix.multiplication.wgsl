struct Matrix {
    size : vec2<f32>;
    data: array<f32>;
};

@group(0) @binding(0)
var<storage, read> matrixA : Matrix;
@group(0) @binding(1)
var<storage, read> matrixB : Matrix;
@group(0) @binding(2)
var<storage, write> matrixC : Matrix;

@stage(compute) @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    if (global_id.x >= u32(matrixA.size.x) || global_id.y >= u32(matrixB.size.y)) {
        return;
    }
    let resultCell = global_id.xy;
    var result : f32 = 0.0;
    for (var i = 0u; i < u32(matrixA.size.y); i = i + 1u) {
        let aCell = i + resultCell.x * u32(matrixA.size.y);
        let bCell = resultCell.y + i * u32(matrixB.size.y);
        result = result + matrixA.data[aCell] * matrixB.data[bCell];
    }
    let resultIndex = resultCell.y + resultCell.x * u32(matrixB.size.y);
    matrixC.data[resultIndex] = result;
}