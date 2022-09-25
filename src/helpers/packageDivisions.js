const packageDivisions = [
    { key: 'AGENT', value: 'Agent licensing' },
    { key: 'MORTGAGE', value: 'Mortgage loan origination' },
    { key: 'APPRAISAL', value: 'Appraisal' },
    { key: 'HOME_INSPECTION', value: 'Home inspection' },
];

export default packageDivisions;

export const packageDivisionsMap = packageDivisions.reduce((map, { key, value }) => ({ ...map, [key]: value }), {});
