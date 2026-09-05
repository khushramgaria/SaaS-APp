import activityReducer, {
  fetchWorkspaceActivities,
  fetchProjectActivities,
  clearActivityError,
} from "../../features/activity/activitySlice";

export { fetchWorkspaceActivities, fetchProjectActivities, clearActivityError };
export default activityReducer;
