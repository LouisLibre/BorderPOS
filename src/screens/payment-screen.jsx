import React, { useState, useRef } from "react";
import {
  CreditCard,
  Wallet,
  Banknote,
  CircleDollarSign,
  Eraser,
  SquareX,
  RotateCcw,
} from "lucide-react";
import PaymentCompletionScreen from "@/screens/payment-completion-screen";

const PaymentScreen = ({
  totalDue = 0,
  dollarToPesosRate = 20,
  handleClose,
  handlePaymentComplete,
}) => {
  const [paymentAmount, setPaymentAmount] = useState("0");
  const [balanceDue, setBalanceDue] = useState(-Math.abs(totalDue));
  const [selectedMethods, setSelectedMethods] = useState(["CASH"]); // Default to "CASH" (Pesos)
  const [payments, setPayments] = useState({
    CASH: 0,
    DOLLARS: 0,
    CARD: 0,
    OTHER: 0,
  });
  const [isNewEntry, setIsNewEntry] = useState(true);
  const paymentMethods = ["CASH", "DOLLARS", "CARD", "OTHER"];
  const selectedIndex = paymentMethods.indexOf(selectedMethods[0]);
  const paymentMethodsMap = {
    CASH: { label: "PESOS", icon: <CircleDollarSign style={styles.icon} /> },
    DOLLARS: { label: "DÓLAR", icon: <Banknote style={styles.icon} /> },
    CARD: { label: "TARJETA", icon: <CreditCard style={styles.icon} /> },
    OTHER: { label: "OTROS", icon: <Wallet style={styles.icon} /> },
  };
  const [paymentDetails, setPaymentDetails] = useState(null);
  const clickTimeoutRef = useRef(null);
  const clickCountRef = useRef(0);

  // Update the handleFinalizePayment function to show the completion modal
  const handleFinalizePayment = () => {
    const buttonState = getCobrarButtonState();
    // Calculate the payment details
    /**
     * @typedef {Object} PaymentDetails
     * @property {number} totalPaid - Total amount paid
     * @property {number} change - Change amount
     * @property {number} dollarsPaid - Amount paid in dollars
     * @property {number} pesosPaid - Amount paid in pesos
     * @property {number} cardsPaid - Amount paid in cards
     * @property {number} othersPaid - Amount paid in other methods
     */

    /**
     * @type {PaymentDetails}
     */
    const details = {
      totalPaid: parseFloat(calculateTotal()),
      change: parseFloat(balanceDue) > 0 ? parseFloat(balanceDue) : 0,
      dollarsPaid: payments.DOLLARS,
      pesosPaid: payments.CASH,
      cardsPaid: payments.CARD,
      othersPaid: payments.OTHER,
    };

    // Call the parent's payment complete handler
    if (handlePaymentComplete) {
      handlePaymentComplete(details);
    } else {
      // Fallback if handlePaymentComplete is not provided
      alert("Payment finalized successfully!");
      handleClose();
    }

    // Reset payment state
    setPayments({ CASH: 0, DOLLARS: 0, CARD: 0, OTHER: 0 });
    setBalanceDue(-Math.abs(totalDue));
    setPaymentAmount("0");
    setSelectedMethods(["CASH"]); // Reset to default method (Pesos)
    setIsNewEntry(true);
  };

  const handleExtendedPresetKeyInteraction = (amount) => {
    // First, set the amount as normal
    handlePresetAmount(amount);

    // Setup for double-click detection
    clickCountRef.current += 1;

    // Clear any existing timeout for double-click detection
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Set a new timeout to reset click count after 300ms
    clickTimeoutRef.current = setTimeout(() => {
      // If we reached 2 clicks (double-click), trigger finalize
      if (clickCountRef.current >= 2) {
        console.log("sup bitch");
        handleFinalizePayment();
      }
      clickCountRef.current = 0;
    }, 300);
  };

  const calculateTotal = () => {
    const total =
      payments.CASH +
      payments.DOLLARS * dollarToPesosRate +
      payments.CARD +
      payments.OTHER;
    return total.toFixed(2);
  };

  // Reset individual payment methods
  const resetPayment = (method) => {
    const amountToSubtract =
      method === "DOLLARS"
        ? payments[method] * dollarToPesosRate
        : payments[method];

    setPayments((prev) => ({
      ...prev,
      [method]: 0,
    }));
    setBalanceDue((prev) => prev - amountToSubtract);
  };

  // Reset dollars specifically (affects both DOLLARS and conversion line)
  const resetDollars = () => {
    const amountToSubtract = payments.DOLLARS * dollarToPesosRate;
    setPayments((prev) => ({
      ...prev,
      DOLLARS: 0,
    }));
    setBalanceDue((prev) => prev - amountToSubtract);
  };

  // Reset all payments
  const resetAll = () => {
    setPayments({
      CASH: 0,
      DOLLARS: 0,
      CARD: 0,
      OTHER: 0,
    });
    setBalanceDue(-Math.abs(totalDue));
  };

  const handleNumberClick = (number) => {
    setPaymentAmount((prev) => {
      const [integerPart, decimalPart = ""] = prev.split(".");

      if (isNewEntry) {
        setIsNewEntry(false);
        return number === "00" ? "0" : number;
      }

      if (decimalPart.length >= 2 && prev.includes(".")) {
        return prev;
      }

      if (!prev.includes(".")) {
        if (number === "0" || number === "00") {
          if (parseInt(integerPart) === 0) return prev;
          return prev + (number === "00" ? "00" : "0");
        }
        const newInteger = (parseInt(integerPart + number) || 0).toString();
        return newInteger;
      }

      if (prev.includes(".")) {
        if (number === "00" && decimalPart.length === 0) return prev + "00";
        if (number === "00" && decimalPart.length === 1) return prev + "0";
        if (number === "0" && decimalPart.length === 0) return prev + "0";
        if (number === "0" && decimalPart === "0") return prev;
        return prev + number;
      }

      return prev + number;
    });
  };

  const handleClear = () => {
    setPaymentAmount("0");
    setIsNewEntry(true);
  };

  const handleBackspace = () => {
    setPaymentAmount((prev) => {
      if (prev.length <= 1) {
        setIsNewEntry(true);
        return "0";
      }
      const newValue = prev.slice(0, -1);
      if (!newValue.includes(".")) {
        return (parseInt(newValue) || 0).toString();
      }
      return newValue;
    });
  };

  const handleDecimal = () => {
    setPaymentAmount((prev) => {
      if (isNewEntry) {
        setIsNewEntry(false);
        return "0.";
      }
      if (!prev.includes(".")) {
        return prev + ".";
      }
      return prev;
    });
  };

  const handlePresetAmount = (amount) => {
    setPaymentAmount(amount);
    setIsNewEntry(true);
  };

  // Handle toggle button selection
  const handlePaymentMethodToggle = (method) => {
    setSelectedMethods([method]); // Only allow one method to be selected at a time
  };

  // Handle the "add" button to apply payment to the selected method
  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0 && selectedMethods.length > 0) {
      const method = selectedMethods[0]; // Only one method should be selected
      const amountToAdd =
        method === "DOLLARS" ? amount * dollarToPesosRate : amount;

      setPayments((prev) => ({
        ...prev,
        [method]: (prev[method] || 0) + amount,
      }));
      setBalanceDue((prev) => prev + amountToAdd);
      setPaymentAmount("0");
      setIsNewEntry(true);
    }
  };

  const getCobrarButtonState = React.useCallback(() => {
    if (balanceDue < 0) {
      return { label: "Pago Incompleto", disabled: true };
    } else if (balanceDue === 0) {
      return { label: "Pago Exacto", disabled: false };
    } else {
      return { label: `Entregar Cambio $${balanceDue}`, disabled: false };
    }
  }, [balanceDue]);

  const handleCancel = () => {
    setPaymentAmount("0");
    setPayments({ CASH: 0, DOLLARS: 0, CARD: 0, OTHER: 0 });
    setSelectedMethods(["CASH"]); // Reset to default method (Pesos)
    setIsNewEntry(true);
    handleClose();
  };

  const formatBalance = () => {
    const absBalance = Math.abs(balanceDue).toFixed(2);
    if (balanceDue < 0) {
      return { text: `-$${absBalance}`, color: "red" };
    } else if (balanceDue === 0) {
      return { text: `0`, color: "black" };
    } else if (balanceDue > 0) {
      return { text: `+$${absBalance}`, color: "green" };
    }
  };

  const formatBalanceForPresetKey = () => {
    const absBalance = Math.abs(balanceDue).toFixed(2);
    if (balanceDue < 0) {
      return `${absBalance}`;
    } else if (balanceDue === 0) {
      return `0`;
    } else if (balanceDue > 0) {
      return `0`;
    }
  };

  const balanceDisplay = formatBalance();
  const buttonState = getCobrarButtonState();
  const balanceDisplayForPresetKey = formatBalanceForPresetKey();

  return (
    <>
      <div style={styles.container}>
        <div style={styles.titleBar}>
          <div
            style={{
              width: "40%",
              paddingLeft: "18px",
              borderRight: "1px solid #ddd",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingRight: "12px",
              cursor: "pointer",
            }}
            onClick={() => parseFloat(calculateTotal()) > 0 && resetAll()}
          >
            {parseFloat(calculateTotal()) > 0 && (
              <RotateCcw style={{ marginLeft: "6px", height: "20px" }} />
            )}{" "}
          </div>
          <div
            style={{
              width: "60%",
              paddingRight: "18px",
              position: "relative",
            }}
          >
            <div style={styles.cancelButton} onClick={handleCancel}>
              <SquareX />
            </div>
          </div>
        </div>

        <div style={styles.mainContent}>
          <div style={styles.leftSidebar}>
            <div style={styles.breakdown}>
              <div style={styles.breakdownItem}>
                <span>PESOS</span>
                <div style={styles.amountContainer}>
                  <span>${payments.CASH.toFixed(2)}</span>
                  <Eraser
                    style={styles.eraserIcon}
                    onClick={() => resetPayment("CASH")}
                  />
                </div>
              </div>
              <div style={styles.breakdownItem}>
                <span style={{ color: "black" }}>DOLARES</span>
                <div style={styles.amountContainer}>
                  <span style={{ color: "black" }}>
                    ${payments.DOLLARS.toFixed(2)}
                  </span>
                  <Eraser style={styles.eraserIcon} onClick={resetDollars} />
                </div>
              </div>
              <div style={styles.breakdownItem}>
                <span style={{ color: "gray" }}>
                  ↳1 DOLAR = {dollarToPesosRate} PESOS
                </span>
                <div style={styles.amountContainer}>
                  <span style={{ color: "gray" }}>
                    ${(payments.DOLLARS * dollarToPesosRate).toFixed(2)}
                  </span>
                  <Eraser style={styles.eraserIcon} onClick={resetDollars} />
                </div>
              </div>
              <div style={styles.breakdownItem}>
                <span>TARJETA</span>
                <div style={styles.amountContainer}>
                  <span>${payments.CARD.toFixed(2)}</span>
                  <Eraser
                    style={styles.eraserIcon}
                    onClick={() => resetPayment("CARD")}
                  />
                </div>
              </div>
              <div style={styles.breakdownItem}>
                <span>OTROS</span>
                <div style={styles.amountContainer}>
                  <span>${payments.OTHER.toFixed(2)}</span>
                  <Eraser
                    style={styles.eraserIcon}
                    onClick={() => resetPayment("OTHER")}
                  />
                </div>
              </div>
              <hr style={styles.divider} />
              <div style={styles.breakdownItem}>
                <span style={{ color: "gray" }}>TOTAL</span>
                <div style={styles.amountContainer}>
                  <span style={{ color: "gray" }}>${totalDue.toFixed(2)}</span>
                  <div style={{ width: "24px" }}></div>{" "}
                  {/* Placeholder for alignment */}
                </div>
              </div>
              <div style={styles.breakdownItem}>
                <span style={{ color: "gray" }}>TOTAL (DOLAR)</span>
                <div style={styles.amountContainer}>
                  <span style={{ color: "gray" }}>
                    ${(totalDue.toFixed(2) / dollarToPesosRate).toFixed(2)}
                  </span>
                  <div style={{ width: "24px" }}></div>
                </div>
              </div>
              <div style={styles.breakdownItem}>
                <span
                  style={{ color: balanceDisplay.color, fontWeight: "bold" }}
                >
                  BALANCE
                </span>
                <div style={styles.amountContainer}>
                  <span
                    style={{ color: balanceDisplay.color, fontWeight: "bold" }}
                  >
                    {balanceDisplay.text}
                  </span>
                  <div style={{ width: "24px" }}></div>
                </div>
              </div>
            </div>

            <button
              style={{
                ...styles.finalizeButton,
                ...(buttonState.disabled ? styles.disabledButton : {}),
              }}
              onClick={handleFinalizePayment}
              disabled={buttonState.disabled}
            >
              {buttonState.label}
            </button>
          </div>

          <div style={styles.keypadSection}>
            <div style={styles.paymentAmount}>
              <span style={styles.tenderLabel}></span>
              <span style={styles.amount}>${paymentAmount}</span>
            </div>

            {/* Updated toggle container with gray background */}
            <div style={styles.toggleWrapper}>
              <div
                style={{ ...styles.slider, left: `${selectedIndex * 25}%` }}
              ></div>
              <div style={styles.toggleContainer}>
                {paymentMethods.map((method) => (
                  <button
                    key={method}
                    style={{
                      ...styles.toggleButton,
                      color: selectedMethods[0] === method ? "white" : "#333",
                    }}
                    onClick={() => handlePaymentMethodToggle(method)}
                  >
                    {paymentMethodsMap[method].icon}
                    {paymentMethodsMap[method].label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.keypad}>
              <button style={styles.key} onClick={() => handleNumberClick("7")}>
                7
              </button>
              <button style={styles.key} onClick={() => handleNumberClick("8")}>
                8
              </button>
              <button style={styles.key} onClick={() => handleNumberClick("9")}>
                9
              </button>
              <button style={styles.backspaceKey} onClick={handleBackspace}>
                ⌫
              </button>
              <button style={styles.key} onClick={() => handleNumberClick("4")}>
                4
              </button>
              <button style={styles.key} onClick={() => handleNumberClick("5")}>
                5
              </button>
              <button style={styles.key} onClick={() => handleNumberClick("6")}>
                6
              </button>
              <button
                style={{ ...styles.specialKey, gridRow: "span 1" }}
                onClick={handleClear}
              >
                C
              </button>
              <button style={styles.key} onClick={() => handleNumberClick("1")}>
                1
              </button>
              <button style={styles.key} onClick={() => handleNumberClick("2")}>
                2
              </button>
              <button style={styles.key} onClick={() => handleNumberClick("3")}>
                3
              </button>
              <button
                style={{
                  ...styles.specialKey,
                  backgroundColor: "black",
                  color: "white",
                }}
                onClick={handleAddPayment}
              >
                Agregar
              </button>
              <button
                style={styles.zeroKey}
                onClick={() => handleNumberClick("0")}
              >
                0
              </button>
              <button style={styles.key} onClick={() => handleDecimal()}>
                .
              </button>
              <button
                style={styles.presetKeyExtended}
                onClick={() =>
                  handleExtendedPresetKeyInteraction(balanceDisplayForPresetKey)
                }
              >
                ${balanceDisplayForPresetKey}
              </button>
              <button
                style={styles.presetKey}
                onClick={() => handlePresetAmount("10.00")}
              >
                $10
              </button>
              <button
                style={styles.presetKey}
                onClick={() => handlePresetAmount("20.00")}
              >
                $20
              </button>
              <button
                style={styles.presetKey}
                onClick={() => handlePresetAmount("50.00")}
              >
                $50
              </button>
              <button
                style={styles.presetKey}
                onClick={() => handlePresetAmount("100.00")}
              >
                $100
              </button>
              <button
                style={styles.presetKey}
                onClick={() => handlePresetAmount("200.00")}
              >
                $200
              </button>
              <button
                style={styles.presetKey}
                onClick={() => handlePresetAmount("500.00")}
              >
                $500
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100%",
    fontFamily: "Arial, sans-serif",
    flexDirection: "column",
    borderRadius: "10px",
  },
  mainContent: {
    display: "flex",
    height: "100%",
    borderRadius: "10px",
  },
  titleBar: {
    display: "flex",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    boxShadow: "0 0.2px 0.2px rgba(0, 0, 0, 0.1)",
    height: "44px",
    position: "relative",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
  },
  cancelButton: {
    position: "absolute",
    right: "18px",
    top: "10px",
    display: "flex",
    gap: "4px",
    cursor: "pointer",
  },
  title: {
    fontSize: "14px",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  leftSidebar: {
    width: "40%",
    padding: "18px",
    paddingBottom: "16px",
    backgroundColor: "#f5f7fa",
    borderRight: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    overflowY: "auto",
    borderBottomLeftRadius: "10px",
  },
  breakdown: {
    flex: 1,
  },
  breakdownItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "16px",
  },
  amountContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  eraserIcon: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    color: "#666",
    transition: "color 0.2s",
  },
  keypadSection: {
    width: "60%",
    padding: "18px",
    paddingTop: "14px",
    paddingBottom: "16px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "10px",
  },
  paymentAmount: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px",
    border: "2px solid black",
    borderRadius: "5px",
    marginBottom: "10px",
    fontSize: "18px",
  },
  tenderLabel: {
    color: "#888",
    fontSize: "16px",
  },
  amount: {
    fontSize: "24px",
    fontWeight: "bold",
    paddingRight: "2px",
  },
  keypad: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "repeat(6, 1fr)",
    gap: "10px",
    flex: 1,
  },
  key: {
    padding: "14px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  zeroKey: {
    padding: "16px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fff",
    cursor: "pointer",
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backspaceKey: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#e0e0e0",
    cursor: "pointer",
    gridRow: "span 1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  specialKey: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#e0e0e0",
    cursor: "pointer",
    gridRow: "span 2", // For the decimal button
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  presetKeyExtended: {
    gridColumn: "span 2",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "black", // Changed from #fff to #e0e0e0
    cursor: "pointer",
    color: "white",
    fontWeight: "550",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  presetKey: {
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#e0e0e0", // Changed from #fff to #e0e0e0
    cursor: "pointer",
    color: "#444",
    fontWeight: "550",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleWrapper: {
    position: "relative",
    backgroundColor: "#e0e0e0",
    borderRadius: "5px",
    padding: "2px",
    marginBottom: "10px",
    overflow: "hidden",
  },
  toggleContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "2px",
    position: "relative",
  },
  slider: {
    position: "absolute",
    top: "2px",
    left: "0",
    width: "25%",
    height: "calc(100% - 4px)",
    backgroundColor: "black",
    borderRadius: "5px",
    transition: "left 0.3s",
  },
  toggleButton: {
    flex: 1,
    padding: "10px",
    fontSize: "14px",
    border: "none",
    borderRadius: "3px",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    color: "#333",
    transition: "color 0.2s",
    zIndex: 1,
  },
  activeToggle: {
    backgroundColor: "black",
    color: "white",
  },
  icon: {
    fontSize: "20px",
    color: "inherit",
  },
  finalizeButton: {
    padding: "41.5px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "black",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    cursor: "not-allowed",
    opacity: "0.6",
  },
  divider: {
    border: 0,
    borderTop: "1px solid #ddd",
    margin: "10px 0",
  },
};

// Add hover effect to eraserIcon
styles.eraserIcon[":hover"] = {
  color: "#ff4444",
};

export default PaymentScreen;
