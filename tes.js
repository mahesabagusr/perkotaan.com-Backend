const input_waktu_mulai = "2024-01-07";
const input_waktu_target = "2024-01-08";

const start_time = new Date(input_waktu_mulai);
const target_time = new Date(input_waktu_target);

const estimation_time = target_time - start_time;
const timestamp = estimation_time.to();

console.log(start_time); // 2024-01-07T00:00:00.000Z
console.log(target_time); // 2024-01-08T00:00:00.000Z
console.log(estimation_time); // 86400000
console.log(timestamp); // 2024-01-07T00:00:00.000Z