
import React from "react";

interface ValueForMoneyProps {
  laptopName: string;
  valueAssessment: string;
}

const ValueForMoney: React.FC<ValueForMoneyProps> = ({
  laptopName,
  valueAssessment
}) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Value for Money</h3>
      <p>{valueAssessment}</p>
    </div>
  );
};

export default ValueForMoney;
