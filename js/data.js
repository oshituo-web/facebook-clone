
// Connect data.js to the shared Supabase client.
import { supabase } from "./supabaseClient.js";

/* =========================================
   DATA & API (Role 5)
========================================= */


/* =========================================
   GET USERS
========================================= */

export async function getUsers() {

    const response = await fetch("./data/users.json");

    if (!response.ok) {
        throw new Error(`Failed to load users: ${response.status}`);
    }

    return response.json();
}


/* =========================================
   GET POSTS
========================================= */

export async function getPosts() {

    const response = await fetch("./data/posts.json");

    if (!response.ok) {
        throw new Error(`Failed to load posts: ${response.status}`);
    }

    return response.json();
}


/* =========================================
   GET STORIES
========================================= */

export async function getStories() {

    const response = await fetch("./data/stories.json");

    if (!response.ok) {
        throw new Error(`Failed to load stories: ${response.status}`);
    }

    return response.json();
}


/* =========================================
   GET COMMENTS
========================================= */

export async function getComments() {

    const response = await fetch("./data/comments.json");

    if (!response.ok) {
        throw new Error(`Failed to load comments: ${response.status}`);
    }

    return response.json();
}


/* =========================================
   FIND USER BY ID
========================================= */

export function getUserById(users, userId) {

    return users.find(
        user => user.id === userId
    );
}


/* =========================================
   FIND POSTS BY USER
========================================= */

export function getPostsByUser(posts, userId) {

    return posts.filter(
        post => post.userId === userId
    );
}


/* =========================================
   FIND COMMENTS FOR A POST
========================================= */

export function getCommentsForPost(comments, postId) {

    return comments.filter(
        comment => comment.postId === postId
    );
}


/* =========================================================
   SUPABASE: AUTHENTICATED USER HELPER

   This helper gets the currently signed-in Supabase user.
   The functions below use it to restrict their operations
   to the appropriate authenticated account.
========================================================= */

async function getCurrentAuthenticatedUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    if (!data.user) {
        throw new Error("You must be logged in to use this feature.");
    }

    return data.user;
}


/* =========================================================
   MESSENGER 1: GET OTHER REGISTERED USERS

   Retrieve profiles that the signed-in user can select
   when starting a conversation.

   The current user is excluded from the results.
========================================================= */

export async function getMessageableProfiles() {
    const currentUser = await getCurrentAuthenticatedUser();

    const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .neq("id", currentUser.id)
        .order("display_name", { ascending: true });

    if (error) {
        throw error;
    }

    return data ?? [];
}


/* =========================================================
   NOTIFICATIONS 1: GET MY NOTIFICATIONS

   Retrieve notifications addressed to the signed-in user.
   Newest notifications appear first.
========================================================= */

export async function getMyNotifications() {
    const currentUser = await getCurrentAuthenticatedUser();

    const { data, error } = await supabase
        .from("notifications")
        .select("id, actor_id, message, is_read, created_at")
        .eq("recipient_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        throw error;
    }

    return data ?? [];
}


/* =========================================================
   NOTIFICATIONS 2: MARK A NOTIFICATION AS READ

   Only attempt to mark a notification belonging to the
   signed-in user as read. Supabase RLS provides the
   additional database-level access control.
========================================================= */

export async function markNotificationRead(notificationId) {
    if (notificationId === undefined || notificationId === null) {
        throw new Error("A notification ID is required.");
    }

    const currentUser = await getCurrentAuthenticatedUser();

    const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("recipient_id", currentUser.id)
        .select("id, is_read")
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}



// =========================================================
// FRIEND REQUESTS 5: GET FRIEND SUGGESTIONS
// - Excludes the signed-in user.
// - Excludes anyone with an existing friend-request record
//   in either direction.
// - Does not yet rank people by mutual friends.
// =========================================================

export async function getFriendSuggestions() {
    const currentUser = await getCurrentAuthenticatedUser();

    // Make sure a user is signed in before querying suggestions.
    if (!currentUser) {
        throw new Error("Please sign in to view friend suggestions.");
    }

    // Reuse the existing function to load other registered profiles.
    const profiles = await getMessageableProfiles();

    // Retrieve requests involving the signed-in user.
    const { data: requests, error } = await supabase
        .from("friend_requests")
        .select("requester_id, recipient_id")
        .or(
            `requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`
        );

    if (error) {
        throw error;
    }

    // Exclude people with pending, accepted, or rejected requests.
    const excludedUserIds = new Set(
        (requests ?? []).map(request =>
            request.requester_id === currentUser.id
                ? request.recipient_id
                : request.requester_id
        )
    );

    // Return only eligible profiles.
    return profiles.filter(
        profile =>
            profile.id !== currentUser.id &&
            !excludedUserIds.has(profile.id)
    );
}



/* =========================================================
   FRIEND REQUESTS 1: SEND A FRIEND REQUEST
   The sender ID comes from Supabase Auth.
   The recipient ID must be a real profile UUID.
   ========================================================= */

export async function sendFriendRequest(recipientId) {
    const currentUser = await getCurrentAuthenticatedUser();

    // Ensure the user is signed in.
    if (!currentUser) {
        throw new Error("Please sign in before sending a friend request.");
    }

    // Prevent sending a request to yourself or an invalid recipient.
    if (!recipientId || recipientId === currentUser.id) {
        throw new Error("Please select a valid person to add.");
    }

    // Check whether a request exists in either direction.
    const { data: existingRequests, error: lookupError } = await supabase
        .from("friend_requests")
        .select("id, requester_id, recipient_id, status")
        .or(
            `and(requester_id.eq.${currentUser.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${currentUser.id})`
        );

    if (lookupError) {
        throw lookupError;
    }

    const requests = existingRequests ?? [];

    if (requests.some(request => request.status === "pending")) {
        throw new Error(
            "A pending friend request already exists between these users."
        );
    }

    if (requests.some(request => request.status === "accepted")) {
        throw new Error("You are already friends with this person.");
    }

    // Create the request. The database trigger should create its notification.
    const { data, error } = await supabase
        .from("friend_requests")
        .insert({
            requester_id: currentUser.id,
            recipient_id: recipientId,
            status: "pending"
        })
        .select("id, requester_id, recipient_id, status, created_at")
        .single();

    if (error) {
        throw error;
    }

    return data;
}



// =========================================================
// FRIEND REQUESTS 2: GET INCOMING REQUESTS
// Return pending requests addressed to the signed-in user.
// =========================================================

export async function getIncomingFriendRequests() {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
        throw new Error("Please sign in to view friend requests.");
    }

    const { data, error } = await supabase
        .from("friend_requests")
        .select("id, requester_id, recipient_id, status, created_at")
        .eq("recipient_id", currentUser.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data ?? [];
}


// =========================================================
// FRIEND REQUESTS 3: ACCEPT OR REJECT A REQUEST
// Only the recipient can respond, as enforced by RLS.
// =========================================================

export async function respondToFriendRequest(requestId, accept) {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
        throw new Error("Please sign in to respond to friend requests.");
    }

    if (requestId === undefined || requestId === null || typeof accept !== "boolean") {
        throw new Error("A valid request and response are required.");
    }

    const newStatus = accept ? "accepted" : "rejected";

    const { data, error } = await supabase
        .from("friend_requests")
        .update({
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq("id", requestId)
        .eq("recipient_id", currentUser.id)
        .eq("status", "pending")
        .select("id, requester_id, recipient_id, status")
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error(
            "This request may already have been handled, or you cannot respond to it."
        );
    }

    // The database trigger notifies the requester if accepted.
    // Do not insert another notification here.
    return data;
}
       


/* =========================================================
   MESSENGER 2: LOAD A CONVERSATION

   Retrieve messages exchanged between the signed-in user
   and the selected user, ordered from oldest to newest.

   The database's Row Level Security policies must allow
   the signed-in user to read messages in this conversation.
========================================================= */

export async function getConversationMessages(otherUserId) {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!otherUserId || otherUserId === currentUser.id) {
        throw new Error("Select another user to open a conversation.");
    }

    const { data, error } = await supabase
        .from("messages")
        .select(
            "id, sender_id, recipient_id, content, is_read, status, created_at"
        )
        .or(
            `and(sender_id.eq.${currentUser.id},recipient_id.eq.${otherUserId}),` +
            `and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });

    if (error) {
        throw error;
    }

    return data ?? [];
}


/* =========================================================
   MESSENGER 3: SEND A DIRECT MESSAGE

   Send a message from the signed-in user to the selected
   recipient. The sender ID always comes from Supabase Auth,
   not from a value supplied by the browser interface.
========================================================= */

export async function sendDirectMessage(recipientId, content) {
    const currentUser = await getCurrentAuthenticatedUser();

    const messageContent =
        typeof content === "string" ? content.trim() : "";

    if (!recipientId || recipientId === currentUser.id) {
        throw new Error("Please select a valid recipient.");
    }

    if (!messageContent) {
        throw new Error("Please enter a message before sending.");
    }

    const { data, error } = await supabase
        .from("messages")
        .insert({
            sender_id: currentUser.id,
            recipient_id: recipientId,
            content: messageContent
        })
        .select(
            "id, sender_id, recipient_id, content, is_read, status, created_at"
        )
        .single();

    if (error) {
        throw error;
    }

    return data;
}


/* =========================================================
   MESSENGER 4: MARK RECEIVED MESSAGES AS READ

   When the signed-in user opens a conversation, mark
   unread messages received from the selected user as read.

   Messages sent by the current user are not modified.
========================================================= */

export async function markReceivedMessagesRead(otherUserId) {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!otherUserId || otherUserId === currentUser.id) {
        throw new Error("Select a valid conversation.");
    }

    const { data, error } = await supabase
        .from("messages")
        .update({ is_read: true, status:"read" })
        .eq("sender_id", otherUserId)
        .eq("recipient_id", currentUser.id)
        .eq("is_read", false)
        .select("id, is_read, status");

    if (error) {
        throw error;
    }

    return data ?? [];
}


/*=========================================================
    MESSENGER 5: MARK RECEIVED MESSAGES AS DELIVERED 

    Call this when the recipient's app successfully Loads
    incoming messages in an open conversation.

    Do not downgrade messages already marked as read.
    =====================================================*/

    export async function markReceivedMessagesDelivered(otherUserId) {
        const currentUser = await getCurrentAuthenticatedUser();

        if (!otherUserId || otherUserId === currentUser.id) {
            throw new Error("Select a valid conversation.");
        } 
        
        const { data, error } = await supabase
        .from("messages")
        .update({ status: "delivered"})

        .eq("sender_id", otherUserId)
        .eq("recipient_id", currentUser.id)
        .eq("status", "sent")
        .select("id, status");

        if (error) {
            throw error;
        }
        return data ?? [];
    }

    


/* =========================================================
   FRIENDS LIST: GET MY ACCEPTED FRIENDS

   Find accepted friend requests involving the signed-in
   user, then retrieve the profiles of those friends.
========================================================= */

export async function getMyFriends() {
    const currentUser = await getCurrentAuthenticatedUser();

    // Find friendships where the current user is either
    // the person who sent the request or the recipient.
    const { data: friendships, error: friendshipError } =
        await supabase
            .from("friend_requests")
            .select("requester_id, recipient_id")
            .eq("status", "accepted")
            .or(
                `requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`
            );

    if (friendshipError) {
        throw friendshipError;
    }

    // Collect the IDs of the accepted friends.
    const friendIds = [
        ...new Set(
            (friendships ?? []).map((friendship) =>
                friendship.requester_id === currentUser.id
                    ? friendship.recipient_id
                    : friendship.requester_id
            )
        )
    ];

    // Return an empty list when the user has no friends.
    if (friendIds.length === 0) {
        return [];
    }

    // Retrieve the friends' actual Supabase profiles.
    const { data: friends, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", friendIds)
        .order("display_name", { ascending: true });

    if (profilesError) {
        throw profilesError;
    }

    return friends ?? [];
}

