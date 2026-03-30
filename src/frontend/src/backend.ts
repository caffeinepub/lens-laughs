/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";
export interface Some<T> { __kind__: "Some"; value: T; }
export interface None { __kind__: "None"; }
export type Option<T> = Some<T> | None;
function some<T>(value: T): Some<T> { return { __kind__: "Some", value }; }
function none(): None { return { __kind__: "None" }; }
function isNone<T>(option: Option<T>): option is None { return option.__kind__ === "None"; }
function isSome<T>(option: Option<T>): option is Some<T> { return option.__kind__ === "Some"; }
function unwrap<T>(option: Option<T>): T {
    if (isNone(option)) { throw new Error("unwrap: none"); }
    return option.value;
}
function candid_some<T>(value: T): [T] { return [value]; }
function candid_none<T>(): [] { return []; }
function record_opt_to_undefined<T>(arg: T | null): T | undefined { return arg == null ? undefined : arg; }
export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
        if (blob) { this._blob = blob; }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) { return this._blob; }
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string { return this.directURL; }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}
export type Time = bigint;
export interface ContactSubmission {
    name: string; isRead: boolean; email: string; message: string;
    timestamp: Time; isReplied: boolean; phone: string; eventDate: string;
}
export interface BookingRequest {
    status: string; name: string; email: string; message: string;
    timestamp: Time; phone: string; eventDate: string; eventType: string;
}
export interface PortfolioItem {
    id: bigint; blobKey: string; caption: string; displayOrder: bigint;
}
export interface ContentEntry { key: string; value: string; }
export interface ServicePackage {
    id: bigint; name: string; subtitle: string; price: string;
    description: string; features: Array<string>; highlighted: boolean; displayOrder: bigint;
}
export interface backendInterface {
    authenticateAdmin(password: string): Promise<boolean>;
    getAllBookings(password: string): Promise<Array<BookingRequest>>;
    getAllContactSubmissions(password: string): Promise<Array<ContactSubmission>>;
    markContactAsRead(password: string, submissionId: bigint): Promise<void>;
    markContactAsReplied(password: string, submissionId: bigint): Promise<void>;
    submitBookingRequest(name: string, email: string, phone: string, eventType: string, eventDate: string, message: string): Promise<bigint>;
    submitContactForm(name: string, email: string, phone: string, message: string, eventDate: string): Promise<bigint>;
    updateBookingStatus(password: string, bookingId: bigint, newStatus: string): Promise<void>;
    getPortfolioItems(): Promise<Array<PortfolioItem>>;
    addPortfolioItem(password: string, blobKey: string, caption: string): Promise<bigint>;
    deletePortfolioItem(password: string, id: bigint): Promise<void>;
    updatePortfolioCaption(password: string, id: bigint, caption: string): Promise<void>;
    getSiteContent(): Promise<Array<ContentEntry>>;
    setSiteContent(password: string, key: string, value: string): Promise<void>;
    setSiteContentBatch(password: string, entries: Array<[string, string]>): Promise<void>;
    getServicePackages(): Promise<Array<ServicePackage>>;
    initializeServices(password: string): Promise<void>;
    updateServicePackage(password: string, id: bigint, name: string, subtitle: string, price: string, description: string, features: Array<string>, highlighted: boolean): Promise<void>;
}
export class Backend implements backendInterface {
    constructor(private actor: ActorSubclass<_SERVICE>, private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>, private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>, private processError?: (error: unknown) => never) {}
    private async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.processError) {
            try { return await fn(); } catch (e) { this.processError(e); throw new Error("unreachable"); }
        }
        return fn();
    }
    async authenticateAdmin(arg0: string): Promise<boolean> { return this.call(() => this.actor.authenticateAdmin(arg0)); }
    async getAllBookings(arg0: string): Promise<Array<BookingRequest>> { return this.call(() => this.actor.getAllBookings(arg0)); }
    async getAllContactSubmissions(arg0: string): Promise<Array<ContactSubmission>> { return this.call(() => this.actor.getAllContactSubmissions(arg0)); }
    async markContactAsRead(arg0: string, arg1: bigint): Promise<void> { return this.call(() => this.actor.markContactAsRead(arg0, arg1)); }
    async markContactAsReplied(arg0: string, arg1: bigint): Promise<void> { return this.call(() => this.actor.markContactAsReplied(arg0, arg1)); }
    async submitBookingRequest(arg0: string, arg1: string, arg2: string, arg3: string, arg4: string, arg5: string): Promise<bigint> { return this.call(() => this.actor.submitBookingRequest(arg0, arg1, arg2, arg3, arg4, arg5)); }
    async submitContactForm(arg0: string, arg1: string, arg2: string, arg3: string, arg4: string): Promise<bigint> { return this.call(() => this.actor.submitContactForm(arg0, arg1, arg2, arg3, arg4)); }
    async updateBookingStatus(arg0: string, arg1: bigint, arg2: string): Promise<void> { return this.call(() => this.actor.updateBookingStatus(arg0, arg1, arg2)); }
    async getPortfolioItems(): Promise<Array<PortfolioItem>> { return this.call(() => this.actor.getPortfolioItems()); }
    async addPortfolioItem(arg0: string, arg1: string, arg2: string): Promise<bigint> { return this.call(() => this.actor.addPortfolioItem(arg0, arg1, arg2)); }
    async deletePortfolioItem(arg0: string, arg1: bigint): Promise<void> { return this.call(() => this.actor.deletePortfolioItem(arg0, arg1)); }
    async updatePortfolioCaption(arg0: string, arg1: bigint, arg2: string): Promise<void> { return this.call(() => this.actor.updatePortfolioCaption(arg0, arg1, arg2)); }
    async getSiteContent(): Promise<Array<ContentEntry>> { return this.call(() => this.actor.getSiteContent()); }
    async setSiteContent(arg0: string, arg1: string, arg2: string): Promise<void> { return this.call(() => this.actor.setSiteContent(arg0, arg1, arg2)); }
    async setSiteContentBatch(arg0: string, arg1: Array<[string, string]>): Promise<void> { return this.call(() => this.actor.setSiteContentBatch(arg0, arg1)); }
    async getServicePackages(): Promise<Array<ServicePackage>> { return this.call(() => this.actor.getServicePackages()); }
    async initializeServices(arg0: string): Promise<void> { return this.call(() => this.actor.initializeServices(arg0)); }
    async updateServicePackage(arg0: string, arg1: bigint, arg2: string, arg3: string, arg4: string, arg5: string, arg6: Array<string>, arg7: boolean): Promise<void> { return this.call(() => this.actor.updateServicePackage(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7)); }
}
export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}
export function createActor(canisterId: string, _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>, _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>, options: CreateActorOptions = {}): Backend {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
    if (options.agent && options.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, { agent, canisterId, ...options.actorOptions });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
