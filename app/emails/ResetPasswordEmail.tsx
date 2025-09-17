import * as React from "react";
import { Html } from "@react-email/html";
import {
  Button,
  Container,
  Head,
  Hr,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ResetPasswordEmailProps {
  userName: string;
  resetLink: string;
}

const ResetPasswordEmail = ({
  userName,
  resetLink,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Container style={container}>
        <Section>
          <Text style={heading}>Hi {userName},</Text>
          <Text style={paragraph}>
            You requested to reset your password. Click the button below to set
            a new password. This link is valid for 1 hour.
          </Text>

          <Button href={resetLink} style={button}>
            Reset Password
          </Button>

          <Text style={paragraph}>
            If you did not request this, please ignore this email.
          </Text>
          <Hr />
          <Text style={footer}>© 2025 Edu-Portal. All rights reserved.</Text>
        </Section>
      </Container>
    </Html>
  );
};

export default ResetPasswordEmail;

// 🎨 Inline styles for cross-client compatibility
const container = {
  margin: "0 auto",
  padding: "20px",
  backgroundColor: "#ffffff",
  fontFamily: "Arial, sans-serif",
  border: "1px solid #eaeaea",
  borderRadius: "6px",
  maxWidth: "480px",
};

const heading = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "12px",
};

const paragraph = {
  fontSize: "14px",
  color: "#333333",
  lineHeight: "20px",
  marginBottom: "20px",
};

const button = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "5px",
  textDecoration: "none",
  fontWeight: "bold",
};

const footer = {
  fontSize: "12px",
  color: "#888888",
  textAlign: "center" as const,
};
