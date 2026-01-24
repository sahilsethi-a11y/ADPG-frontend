export const isValidPassword = (password: string) => {
    return !(password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password));
};

export const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidDob = (date: string) => {
    const currDate = new Date();
    const birthDate = new Date(date);

    const ageDiff = currDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currDate.getMonth() - birthDate.getMonth();
    const dayDiff = currDate.getDate() - birthDate.getDate();

    const is18OrOlder = ageDiff > 18 || (ageDiff === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

    if (!is18OrOlder) {
        return false;
    }
    if (ageDiff >= 100) return false;
    return true;
};

export const isValidMobileNo = (mobile: string) => {
    const regex = /^(?:\+971\d{9}|05\d{8})$/;
    return regex.test(mobile);
};
