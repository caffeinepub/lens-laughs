import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import BlobStorageMixin "blob-storage/Mixin";

actor {
  include BlobStorageMixin();

  // NOTE: ContactSubmission and BookingRequest intentionally do NOT have an `id`
  // field — the id is the Map key, not part of the record, to stay compatible
  // with the previously deployed canister schema.
  type ContactSubmission = {
    name : Text;
    email : Text;
    phone : Text;
    message : Text;
    eventDate : Text;
    isRead : Bool;
    isReplied : Bool;
    timestamp : Time.Time;
  };

  type BookingRequest = {
    name : Text;
    email : Text;
    phone : Text;
    eventType : Text;
    eventDate : Text;
    message : Text;
    timestamp : Time.Time;
    status : Text;
  };

  type PortfolioItem = {
    id : Nat;
    blobKey : Text;
    caption : Text;
    displayOrder : Nat;
  };

  type ContentEntry = {
    key : Text;
    value : Text;
  };

  type ServicePackage = {
    id : Nat;
    name : Text;
    subtitle : Text;
    price : Text;
    description : Text;
    features : [Text];
    highlighted : Bool;
    displayOrder : Nat;
  };

  module ContactSubmission {
    public func compare(c1 : ContactSubmission, c2 : ContactSubmission) : Order.Order {
      Int.compare(c2.timestamp, c1.timestamp);
    };
  };

  module BookingRequest {
    public func compare(b1 : BookingRequest, b2 : BookingRequest) : Order.Order {
      Int.compare(b2.timestamp, b1.timestamp);
    };
  };

  module PortfolioItem {
    public func compare(a : PortfolioItem, b : PortfolioItem) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  module ServicePackage {
    public func compare(a : ServicePackage, b : ServicePackage) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  // ── Counters and in-memory maps
  var nextContactId = 0;
  let contactSubmissions = Map.empty<Nat, ContactSubmission>();

  var nextBookingId = 0;
  let bookingRequests = Map.empty<Nat, BookingRequest>();

  var nextPortfolioId = 0;
  let portfolioItems = Map.empty<Nat, PortfolioItem>();

  let siteContent = Map.empty<Text, Text>();

  // ── Stable storage for ALL persistent data
  stable var _nextContactId : Nat = 0;
  stable var _contactsData : [(Nat, ContactSubmission)] = [];

  stable var _nextBookingId : Nat = 0;
  stable var _bookingsData : [(Nat, BookingRequest)] = [];

  stable var _nextPortfolioId : Nat = 0;
  stable var _portfolioData : [PortfolioItem] = [];

  stable var _siteContentData : [(Text, Text)] = [];

  stable var _servicePackagesData : [ServicePackage] = [];

  // Kept for upgrade compatibility with previously deployed version
  stable var servicesInitialized = false;

  let servicePackages = Map.empty<Nat, ServicePackage>();

  // ── Restore all data from stable storage after upgrade
  system func postupgrade() {
    nextContactId := _nextContactId;
    for ((id, item) in _contactsData.vals()) {
      contactSubmissions.add(id, item);
    };

    nextBookingId := _nextBookingId;
    for ((id, item) in _bookingsData.vals()) {
      bookingRequests.add(id, item);
    };

    nextPortfolioId := _nextPortfolioId;
    for (item in _portfolioData.vals()) {
      portfolioItems.add(item.id, item);
    };

    for ((k, v) in _siteContentData.vals()) {
      siteContent.add(k, v);
    };

    for (pkg in _servicePackagesData.vals()) {
      servicePackages.add(pkg.id, pkg);
    };
  };

  // ── Save all data to stable storage before upgrade
  system func preupgrade() {
    _nextContactId := nextContactId;
    _contactsData := contactSubmissions.entries().toArray();

    _nextBookingId := nextBookingId;
    _bookingsData := bookingRequests.entries().toArray();

    _nextPortfolioId := nextPortfolioId;
    _portfolioData := portfolioItems.values().toArray();

    _siteContentData := siteContent.entries().toArray();

    _servicePackagesData := servicePackages.values().toArray();
  };

  // ── Service package seeding (runs once, persists immediately)
  func ensureServicesInit() {
    if (servicePackages.size() > 0) return;
    servicePackages.add(0, {
      id = 0;
      name = "CREATOR MINI PACK";
      subtitle = "Quick & Fresh";
      price = "\u{20B9}3,999";
      description = "A compact content shoot for creators \u{2014} one nearby location, fast delivery, and reels included.";
      features = ["30\u{2013}45 minute shoot", "1 nearby location (caf\u{E9} / street / home vibe)", "8\u{2013}10 professionally edited photos", "2 short-form reels (trendy + simple edits)", "Basic posing guidance", "Delivery within 48\u{2013}72 hours"];
      highlighted = false;
      displayOrder = 0;
    });
    servicePackages.add(1, {
      id = 1;
      name = "THE SPARK";
      subtitle = "Quick Shoot";
      price = "\u{20B9}4,999";
      description = "A compact 1-hour shoot perfect for headshots, solo portraits, or small brand content. Clean, sharp, and straightforward.";
      features = ["1-hour session", "1 location", "10 edited photos", "Online gallery", "Digital files"];
      highlighted = false;
      displayOrder = 1;
    });
    servicePackages.add(2, {
      id = 2;
      name = "THE FRAME";
      subtitle = "Editorial Session";
      price = "\u{20B9}25,000";
      description = "A focused editorial session for models, brands, or personal style \u{2014} sharp, intentional, and story-driven.";
      features = ["3-hour session", "1\u{2013}2 locations", "100+ edited photos", "Online gallery", "Print-ready files"];
      highlighted = false;
      displayOrder = 2;
    });
    servicePackages.add(3, {
      id = 3;
      name = "THE VISION";
      subtitle = "Full Lookbook / Campaign";
      price = "\u{20B9}50,000";
      description = "A complete visual campaign for fashion brands, designers, or model portfolios. Built to make a statement.";
      features = ["8-hour coverage", "Up to 3 locations", "300+ edited photos", "Brand mood direction", "Online gallery", "Print-ready files"];
      highlighted = true;
      displayOrder = 3;
    });
    servicePackages.add(4, {
      id = 4;
      name = "THE LEGACY";
      subtitle = "Premium Multi-Day";
      price = "\u{20B9}85,000";
      description = "For those who want it all \u{2014} weddings, destination shoots, full brand campaigns. Two days, unlimited vision.";
      features = ["16-hour coverage", "Multiple locations", "500+ edited photos", "Premium retouching", "Behind-the-scenes reel", "Priority booking"];
      highlighted = false;
      displayOrder = 4;
    });
    servicePackages.add(5, {
      id = 5;
      name = "INFLUENCER PLAN";
      subtitle = "Content Creator Plan";
      price = "\u{20B9}12,999 \u{2013} \u{20B9}16,999 / month";
      description = "A monthly content package built for influencers and creators \u{2014} consistent shoots, edited photos, and reels to keep your feed active.";
      features = ["2 shoots per month", "30\u{2013}50 edited photos", "6\u{2013}10 reels (short-form videos)", "Basic content direction (poses, trends, ideas)", "Priority delivery"];
      highlighted = false;
      displayOrder = 5;
    });
    // Persist immediately so they survive future upgrades
    _servicePackagesData := servicePackages.values().toArray();
  };

  let adminPassword = "lensandlaughs2024";

  func checkAdminAccess(password : Text) {
    if (not Text.equal(password, adminPassword)) {
      Runtime.trap("Access denied: Incorrect admin password");
    };
  };

  public query ({ caller }) func authenticateAdmin(password : Text) : async Bool {
    Text.equal(password, adminPassword);
  };

  // ── Contact

  public shared ({ caller }) func submitContactForm(name : Text, email : Text, phone : Text, message : Text, eventDate : Text) : async Nat {
    let submissionId = nextContactId;
    nextContactId += 1;
    let submission : ContactSubmission = {
      name; email; phone; message; eventDate;
      isRead = false; isReplied = false;
      timestamp = Time.now();
    };
    contactSubmissions.add(submissionId, submission);
    _nextContactId := nextContactId;
    _contactsData := contactSubmissions.entries().toArray();
    submissionId;
  };

  public shared ({ caller }) func markContactAsRead(password : Text, submissionId : Nat) : async () {
    checkAdminAccess(password);
    switch (contactSubmissions.get(submissionId)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?submission) {
        contactSubmissions.add(submissionId, { submission with isRead = true });
        _contactsData := contactSubmissions.entries().toArray();
      };
    };
  };

  public shared ({ caller }) func markContactAsReplied(password : Text, submissionId : Nat) : async () {
    checkAdminAccess(password);
    switch (contactSubmissions.get(submissionId)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?submission) {
        contactSubmissions.add(submissionId, { submission with isReplied = true });
        _contactsData := contactSubmissions.entries().toArray();
      };
    };
  };

  public shared ({ caller }) func getAllContactSubmissions(password : Text) : async [ContactSubmission] {
    checkAdminAccess(password);
    contactSubmissions.values().toArray().sort();
  };

  // ── Bookings

  public shared ({ caller }) func submitBookingRequest(name : Text, email : Text, phone : Text, eventType : Text, eventDate : Text, message : Text) : async Nat {
    let bookingId = nextBookingId;
    nextBookingId += 1;
    let request : BookingRequest = {
      name; email; phone; eventType; eventDate; message;
      timestamp = Time.now(); status = "pending";
    };
    bookingRequests.add(bookingId, request);
    _nextBookingId := nextBookingId;
    _bookingsData := bookingRequests.entries().toArray();
    bookingId;
  };

  public shared ({ caller }) func updateBookingStatus(password : Text, bookingId : Nat, newStatus : Text) : async () {
    checkAdminAccess(password);
    switch (bookingRequests.get(bookingId)) {
      case (null) { Runtime.trap("Booking request not found") };
      case (?request) {
        bookingRequests.add(bookingId, { request with status = newStatus });
        _bookingsData := bookingRequests.entries().toArray();
      };
    };
  };

  public shared ({ caller }) func getAllBookings(password : Text) : async [BookingRequest] {
    checkAdminAccess(password);
    bookingRequests.values().toArray().sort();
  };

  // ── Portfolio

  public query func getPortfolioItems() : async [PortfolioItem] {
    portfolioItems.values().toArray().sort();
  };

  public shared ({ caller }) func addPortfolioItem(password : Text, blobKey : Text, caption : Text) : async Nat {
    checkAdminAccess(password);
    let id = nextPortfolioId;
    nextPortfolioId += 1;
    let count = portfolioItems.size();
    let item : PortfolioItem = { id; blobKey; caption; displayOrder = count };
    portfolioItems.add(id, item);
    _nextPortfolioId := nextPortfolioId;
    _portfolioData := portfolioItems.values().toArray();
    id;
  };

  public shared ({ caller }) func deletePortfolioItem(password : Text, id : Nat) : async () {
    checkAdminAccess(password);
    ignore portfolioItems.remove(id);
    _portfolioData := portfolioItems.values().toArray();
  };

  public shared ({ caller }) func updatePortfolioCaption(password : Text, id : Nat, caption : Text) : async () {
    checkAdminAccess(password);
    switch (portfolioItems.get(id)) {
      case (null) { Runtime.trap("Portfolio item not found") };
      case (?item) {
        portfolioItems.add(id, { item with caption });
        _portfolioData := portfolioItems.values().toArray();
      };
    };
  };

  // ── Site Content

  public query func getSiteContent() : async [ContentEntry] {
    let entries = siteContent.entries().toArray();
    entries.map(func((k, v) : (Text, Text)) : ContentEntry { { key = k; value = v } });
  };

  public shared ({ caller }) func setSiteContent(password : Text, key : Text, value : Text) : async () {
    checkAdminAccess(password);
    siteContent.add(key, value);
    _siteContentData := siteContent.entries().toArray();
  };

  public shared ({ caller }) func setSiteContentBatch(password : Text, entries : [(Text, Text)]) : async () {
    checkAdminAccess(password);
    for ((key, value) in entries.vals()) {
      siteContent.add(key, value);
    };
    _siteContentData := siteContent.entries().toArray();
  };

  // ── Services

  public shared ({ caller }) func getServicePackages() : async [ServicePackage] {
    ensureServicesInit();
    servicePackages.values().toArray().sort();
  };

  public shared ({ caller }) func initializeServices(password : Text) : async () {
    checkAdminAccess(password);
    ensureServicesInit();
  };

  public shared ({ caller }) func updateServicePackage(
    password : Text,
    id : Nat,
    name : Text,
    subtitle : Text,
    price : Text,
    description : Text,
    features : [Text],
    highlighted : Bool
  ) : async () {
    checkAdminAccess(password);
    ensureServicesInit();
    switch (servicePackages.get(id)) {
      case (null) { Runtime.trap("Service package not found") };
      case (?pkg) {
        servicePackages.add(id, { pkg with name; subtitle; price; description; features; highlighted });
        _servicePackagesData := servicePackages.values().toArray();
      };
    };
  };

  public shared ({ caller }) func reorderServicePackages(
    password : Text,
    orderedIds : [Nat]
  ) : async () {
    checkAdminAccess(password);
    ensureServicesInit();
    var newOrder : Nat = 0;
    for (id in orderedIds.vals()) {
      switch (servicePackages.get(id)) {
        case (null) { /* skip unknown ids */ };
        case (?pkg) {
          servicePackages.add(id, { pkg with displayOrder = newOrder });
          newOrder += 1;
        };
      };
    };
    _servicePackagesData := servicePackages.values().toArray();
  };
};
