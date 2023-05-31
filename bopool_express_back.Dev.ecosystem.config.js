"use strict";
export const apps = [
    {
        name: "bopool_express_back",
        script: "./dist/www.js",
        // instances:0 CPU core 수만큼 생성
        instances: 2,
        exec_mode: "cluster",
        log_date_format: "MM/DD HH:mm:ss",
        watch: true,
        env: {
            NODE_ENV: "development",
        },
        // 문제 발생시 무중단 재시작을 위함
        wait_ready: true,
        listen_timeout: 10000,
        kill_timeout: 5000,
    },
];
