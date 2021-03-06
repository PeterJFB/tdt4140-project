import {fetchWithToken} from '../../api/api';
import {CreateGroupObject} from '../types';
import {GroupObject, UserObject} from '../../types/api';

type AddGroupMemberObject = {
  groupId: number;
  email: string;
};

type AddGroupMemberResponseObject = {
  groupMembers: number[];
};

export const addMemberToGroup = async (values: AddGroupMemberObject) => {
  const body = {
    email: values.email,
  };
  return await fetchWithToken<AddGroupMemberResponseObject>(
    `/api/groups/${values.groupId}/addMember/`,
    'POST',
    body
  ).then(response => {
    let members;
    if (response.missingToken) return {success: false, members};
    if (response.body) members = response.body.groupMembers;
    if (response.status === 200) return {success: true, members};
    else return {success: false, members};
  });
};

export async function fetchGroupInfo(id: number) {
  const response = await fetchWithToken<GroupObject>(
    `/api/groups/${id}/`,
    'GET'
  );
  if (!response.missingToken) return response.body;
  else return;
}

export async function fetchGroupAges(id: number) {
  const response = await fetchWithToken<string[]>(
    `/api/groups/${id}/getAges/`,
    'GET'
  );
  if (!response.missingToken) return response.body;
  else return;
}

export function findAndSortAges(birthdays: string[]) {
  const listAge = birthdays.map(age => {
    return new Date().getFullYear() - new Date(age).getFullYear();
  });
  const listAgeSorted = listAge.sort((n1, n2) => n1 - n2);
  return listAgeSorted;
}

export function generateAgeGapText(birthdays: string[]) {
  const agesSorted = findAndSortAges(birthdays);
  if (agesSorted[0] == agesSorted[agesSorted.length - 1]) {
    return agesSorted[0] + ' y.o.';
  } else {
    return agesSorted[0] + ' - ' + agesSorted[agesSorted.length - 1] + ' y.o.';
  }
}

export const getStoredUser = (): UserObject | undefined => {
  const userJSON = localStorage.getItem('user');
  let user: UserObject | undefined;
  if (userJSON) user = JSON.parse(userJSON);
  return user;
};

export const deleteGroup = async (groupId: number) => {
  const response = await fetchWithToken<undefined>(
    `/api/groups/${groupId}/`,
    'DELETE'
  );
  if (!response.missingToken)
    return {success: response.status == 204 || response.status == 200};
  return {success: false};
};

export const updateGroup = async (
  groupId: number,
  group: CreateGroupObject
) => {
  const interestArr = group.interests.split(',').map(interest => ({
    name: interest,
    description: 'beskrivelse',
  }));
  const body = {
    name: group.name,
    quote: group.quote,
    description: group.description,
    interests: interestArr,
    location: group.location,
    meetingDate: group.meetingDate,
  };
  const response = await fetchWithToken<GroupObject>(
    `/api/groups/${groupId}/`,
    'PUT',
    body
  );
  if (!response.missingToken)
    return {success: response.status == 204 || response.status == 200};
  return {success: false};
};
