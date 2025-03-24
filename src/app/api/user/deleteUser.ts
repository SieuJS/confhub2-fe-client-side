
const deleteUser = async (id: string): Promise<any> => {
    // Use the correct API endpoint and method (DELETE)
    const response = await fetch(`http://localhost:3000/api/v1/user/${id}`, {
    method: 'DELETE',
    // No body needed for a DELETE request
    });

    if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete user.');
    }
};

export default deleteUser;