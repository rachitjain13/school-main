
import { describe, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";

describe("School Portal API Health Tests", () => {
    it("should return 200 when health endpoint is requested", async () => {
        const response = await request(app)
            .get("/api/v1/health");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "School Portal API is running"
        );
        expect(response.body.timestamp).toBeDefined();
    });

    it("should return 404 for an invalid route", async () => {
        const response = await request(app)
            .get("/api/v1/invalid-route");

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    it("should return 503 when database is disconnected", async () => {
        const originalReadyState = mongoose.connection.readyState;

        try {
            Object.defineProperty(mongoose.connection, "readyState", {
                configurable: true,
                value: 0
            });

            const response = await request(app)
                .get("/api/v1/ready");

            expect(response.status).toBe(503);
            expect(response.body.success).toBe(false);
            expect(response.body.database).toBe("disconnected");
        } finally {
            Object.defineProperty(mongoose.connection, "readyState", {
                configurable: true,
                value: originalReadyState
            });
        }
    });

    it("should return 200 when database is connected", async () => {
        const originalReadyState = mongoose.connection.readyState;

        try {
            Object.defineProperty(mongoose.connection, "readyState", {
                configurable: true,
                value: 1
            });

            const response = await request(app)
                .get("/api/v1/ready");

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.database).toBe("connected");
        } finally {
            Object.defineProperty(mongoose.connection, "readyState", {
                configurable: true,
                value: originalReadyState
            });
        }
    });

});
