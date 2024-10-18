import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotAuthenticatedNav = () => {
  return (
    <>
      <Button asChild>
        <Link to="/login">Sign In</Link>
      </Button>
      <Button asChild>
        <Link to="/signup">Sign Up</Link>
      </Button>
    </>
  );
};

export default NotAuthenticatedNav;
