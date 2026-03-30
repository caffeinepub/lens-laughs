/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const Time = IDL.Int;
export const BookingRequest = IDL.Record({
  'status' : IDL.Text,
  'name' : IDL.Text,
  'email' : IDL.Text,
  'message' : IDL.Text,
  'timestamp' : Time,
  'phone' : IDL.Text,
  'eventDate' : IDL.Text,
  'eventType' : IDL.Text,
});
export const ContactSubmission = IDL.Record({
  'name' : IDL.Text,
  'isRead' : IDL.Bool,
  'email' : IDL.Text,
  'message' : IDL.Text,
  'timestamp' : Time,
  'isReplied' : IDL.Bool,
  'phone' : IDL.Text,
  'eventDate' : IDL.Text,
});
export const PortfolioItem = IDL.Record({
  'id' : IDL.Nat,
  'blobKey' : IDL.Text,
  'caption' : IDL.Text,
  'displayOrder' : IDL.Nat,
});
export const ContentEntry = IDL.Record({
  'key' : IDL.Text,
  'value' : IDL.Text,
});
export const ServicePackage = IDL.Record({
  'id' : IDL.Nat,
  'name' : IDL.Text,
  'subtitle' : IDL.Text,
  'price' : IDL.Text,
  'description' : IDL.Text,
  'features' : IDL.Vec(IDL.Text),
  'highlighted' : IDL.Bool,
  'displayOrder' : IDL.Nat,
});

export const idlService = IDL.Service({
  'authenticateAdmin' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  'getAllBookings' : IDL.Func([IDL.Text], [IDL.Vec(BookingRequest)], []),
  'getAllContactSubmissions' : IDL.Func([IDL.Text], [IDL.Vec(ContactSubmission)], []),
  'markContactAsRead' : IDL.Func([IDL.Text, IDL.Nat], [], []),
  'markContactAsReplied' : IDL.Func([IDL.Text, IDL.Nat], [], []),
  'submitBookingRequest' : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
  'submitContactForm' : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
  'updateBookingStatus' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [], []),
  'getPortfolioItems' : IDL.Func([], [IDL.Vec(PortfolioItem)], ['query']),
  'addPortfolioItem' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
  'deletePortfolioItem' : IDL.Func([IDL.Text, IDL.Nat], [], []),
  'updatePortfolioCaption' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [], []),
  'getSiteContent' : IDL.Func([], [IDL.Vec(ContentEntry)], ['query']),
  'setSiteContent' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
  'setSiteContentBatch' : IDL.Func([IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))], [], []),
  'getServicePackages' : IDL.Func([], [IDL.Vec(ServicePackage)], ['query']),
  'initializeServices' : IDL.Func([IDL.Text], [], []),
  'updateServicePackage' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Bool], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const BookingRequest = IDL.Record({
    'status' : IDL.Text,
    'name' : IDL.Text,
    'email' : IDL.Text,
    'message' : IDL.Text,
    'timestamp' : Time,
    'phone' : IDL.Text,
    'eventDate' : IDL.Text,
    'eventType' : IDL.Text,
  });
  const ContactSubmission = IDL.Record({
    'name' : IDL.Text,
    'isRead' : IDL.Bool,
    'email' : IDL.Text,
    'message' : IDL.Text,
    'timestamp' : Time,
    'isReplied' : IDL.Bool,
    'phone' : IDL.Text,
    'eventDate' : IDL.Text,
  });
  const PortfolioItem = IDL.Record({
    'id' : IDL.Nat,
    'blobKey' : IDL.Text,
    'caption' : IDL.Text,
    'displayOrder' : IDL.Nat,
  });
  const ContentEntry = IDL.Record({
    'key' : IDL.Text,
    'value' : IDL.Text,
  });
  const ServicePackage = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'subtitle' : IDL.Text,
    'price' : IDL.Text,
    'description' : IDL.Text,
    'features' : IDL.Vec(IDL.Text),
    'highlighted' : IDL.Bool,
    'displayOrder' : IDL.Nat,
  });

  return IDL.Service({
    'authenticateAdmin' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'getAllBookings' : IDL.Func([IDL.Text], [IDL.Vec(BookingRequest)], []),
    'getAllContactSubmissions' : IDL.Func([IDL.Text], [IDL.Vec(ContactSubmission)], []),
    'markContactAsRead' : IDL.Func([IDL.Text, IDL.Nat], [], []),
    'markContactAsReplied' : IDL.Func([IDL.Text, IDL.Nat], [], []),
    'submitBookingRequest' : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'submitContactForm' : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'updateBookingStatus' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [], []),
    'getPortfolioItems' : IDL.Func([], [IDL.Vec(PortfolioItem)], ['query']),
    'addPortfolioItem' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'deletePortfolioItem' : IDL.Func([IDL.Text, IDL.Nat], [], []),
    'updatePortfolioCaption' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [], []),
    'getSiteContent' : IDL.Func([], [IDL.Vec(ContentEntry)], ['query']),
    'setSiteContent' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    'setSiteContentBatch' : IDL.Func([IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))], [], []),
    'getServicePackages' : IDL.Func([], [IDL.Vec(ServicePackage)], ['query']),
    'initializeServices' : IDL.Func([IDL.Text], [], []),
    'updateServicePackage' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Bool], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
