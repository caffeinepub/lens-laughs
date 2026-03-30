/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface BookingRequest {
  'status' : string,
  'name' : string,
  'email' : string,
  'message' : string,
  'timestamp' : Time,
  'phone' : string,
  'eventDate' : string,
  'eventType' : string,
}
export interface ContactSubmission {
  'name' : string,
  'isRead' : boolean,
  'email' : string,
  'message' : string,
  'timestamp' : Time,
  'isReplied' : boolean,
  'phone' : string,
  'eventDate' : string,
}
export interface PortfolioItem {
  'id' : bigint,
  'blobKey' : string,
  'caption' : string,
  'displayOrder' : bigint,
}
export interface ContentEntry {
  'key' : string,
  'value' : string,
}
export interface ServicePackage {
  'id' : bigint,
  'name' : string,
  'subtitle' : string,
  'price' : string,
  'description' : string,
  'features' : Array<string>,
  'highlighted' : boolean,
  'displayOrder' : bigint,
}
export type Time = bigint;
export interface _SERVICE {
  'authenticateAdmin' : ActorMethod<[string], boolean>,
  'getAllBookings' : ActorMethod<[string], Array<BookingRequest>>,
  'getAllContactSubmissions' : ActorMethod<[string], Array<ContactSubmission>>,
  'markContactAsRead' : ActorMethod<[string, bigint], undefined>,
  'markContactAsReplied' : ActorMethod<[string, bigint], undefined>,
  'submitBookingRequest' : ActorMethod<[string, string, string, string, string, string], bigint>,
  'submitContactForm' : ActorMethod<[string, string, string, string, string], bigint>,
  'updateBookingStatus' : ActorMethod<[string, bigint, string], undefined>,
  'getPortfolioItems' : ActorMethod<[], Array<PortfolioItem>>,
  'addPortfolioItem' : ActorMethod<[string, string, string], bigint>,
  'deletePortfolioItem' : ActorMethod<[string, bigint], undefined>,
  'updatePortfolioCaption' : ActorMethod<[string, bigint, string], undefined>,
  'getSiteContent' : ActorMethod<[], Array<ContentEntry>>,
  'setSiteContent' : ActorMethod<[string, string, string], undefined>,
  'setSiteContentBatch' : ActorMethod<[string, Array<[string, string]>], undefined>,
  'getServicePackages' : ActorMethod<[], Array<ServicePackage>>,
  'initializeServices' : ActorMethod<[string], undefined>,
  'updateServicePackage' : ActorMethod<[string, bigint, string, string, string, string, Array<string>, boolean], undefined>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
