
import {create} from "zustand"
import {axiosInstance} from "../lib/axios.js"
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/";

export const useAuthStore = create((set , get) => ({
    authUser : null,
    isSigningUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,
    isCheckingAuth : false,

    checkAuth : async () => {
        set({isCheckingAuth : true});
        try {
            const res = await axiosInstance.get("/auth/authUser");  
            // this is the api call to backend (api is basically use to connect the backend and frontend) now this request will fetch the data from the backend from /auth/check this end url the baseUrl we already provided while creating the axiosInstance 
            set({authUser : res.data}); 
            get().connectSocket();
        } catch (error) {
            console.log("error in check auth" + error);
            set({authUser : null})
        } finally {
            set({isCheckingAuth : false})
        }
    },

    signup : async (data) => {

        set({isSigningUp : true});
        try {
            const res = await axiosInstance.post("/auth/signup" , data)
            set({authUser : res.data});
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set ({ isSigningUp : false});
        }

    },

    login : async (data) => {
        set({isLoggingIn : true})
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({authUser : res.data});
            toast.success("WELCOME BACK BUDDY!" , {
                icon : "🤩",
            });
        } catch (error) {
            toast.error("Some Error occured" + error.message);
        } finally{
            set({isLoggingIn : false})
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser : null});
            toast.success("logout successfully");
        } catch (error) {
            toast.error("Some Error occured" + error);
        }
    }
}))