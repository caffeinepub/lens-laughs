import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ContactSubmission {
    name: string;
    isRead: boolean;
    email: string;
    message: string;
    timestamp: Time;
    isReplied: boolean;
    phone: string;
    eventDate: string;
}
export interface BookingRequest {
    status: string;
    name: string;
    email: string;
    message: string;
    timestamp: Time;
    phone: string;
    eventDate: string;
    eventType: string;
}
export interface PortfolioItem {
    id: bigint;
    blobKey: string;
    caption: string;
    displayOrder: bigint;
}
export interface ContentEntry {
    key: string;
    value: string;
}
export interface ServicePackage {
    id: bigint;
    name: string;
    subtitle: string;
    price: string;
    description: string;
    features: Array<string>;
    highlighted: boolean;
    displayOrder: bigint;
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
