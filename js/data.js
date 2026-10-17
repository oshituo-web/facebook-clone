
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
            "id, sender_id, recipient_id, content, is_read, created_at"
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
            "id, sender_id, recipient_id, content, is_read, created_at"
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
        .update({ is_read: true })
        .eq("sender_id", otherUserId)
        .eq("recipient_id", currentUser.id)
        .eq("is_read", false)
        .select("id, is_read");

    if (error) {
        throw error;
    }

    return data ?? [];
}
