import api from "./api.js";

//Admin Api Calls
export const createTimetable = (data) => api.post("/timetables", data);

export const deleteTimetable = (id) => api.delete(`/timetables/${id}`);

export const updateTimetable = (id, data) => api.put(`/timetables/${id}`, data);

//Student Api Calls 
export const getTimetables = (params = {}) => 
    api.get("/timetables", { params });

export const getTimetableById = (id) => api.get(`/timetables/${id}`);