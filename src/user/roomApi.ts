// src/user/roomApi.ts
import { CustomError } from "../model/common"; // Import CustomError
import { Room } from "../store/chatStore"; // Import Room type from store

export async function getRooms(
    token: string, // Auth token is needed
    onSuccess: (rooms: Room[]) => void, // Callback for successful fetch
    onError: (error: CustomError) => void // Callback for errors
) {
    try {
        const response = await fetch('/api/rooms', { // Your API endpoint
            method: 'GET',
            headers: {
                // Send the bearer token for authentication
                'Authorization': `Bearer ${token}`
            }
        });

        // Check if the request was successful
        if (!response.ok) {
            let errorData = { error: `Error fetching rooms (${response.status})` };
            try {
                 errorData = await response.json(); // Try to get error details from API
            } catch (e) { /* Ignore if response body isn't JSON */ }
            throw new CustomError(errorData.error || `Error ${response.status}`);
        }

        // Parse the JSON response which should be an array of Room objects
        const rooms: Room[] = await response.json();
        console.log("[getRooms API] Received rooms:", rooms);
        onSuccess(rooms); // Call the success callback with the fetched rooms

    } catch (err) {
        // Handle fetch errors or errors thrown above
        const message = (err instanceof Error) ? err.message : "Unknown error fetching rooms.";
        console.error("[getRooms API] Error:", message);
        onError(new CustomError(message)); // Call the error callback
    }
}