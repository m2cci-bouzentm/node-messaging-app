import * as React from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { GroupMultipleSelectProps } from './types';


function getStyles(name: string, userName: string[], theme: Theme) {
  return {
    fontWeight: userName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}



export default function GroupMultipleSelect({ usersSelectRef, users }: GroupMultipleSelectProps) {
  
  const theme = useTheme();
  const [userName, setUserName] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof userName>) => {
    const { value } = event.target;
    setUserName(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <div className="w-full p-0">
      <FormControl sx={{ padding: 0, margin: 0 }} fullWidth={true}>
        <InputLabel id="group-users-select">Select users</InputLabel>
        <Select
          labelId="group-users-select"
          id="users-select"
          multiple
          value={userName}
          onChange={handleChange}
          input={<OutlinedInput label="Name" />}
          ref={usersSelectRef}
        >
          {users &&
            users.map((user) => (
              <MenuItem
                key={user.id}
                value={user.id}
                style={getStyles(user.username, userName, theme)}
              >
                {user.username}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
}
