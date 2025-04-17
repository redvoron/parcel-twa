import WebApp from "@twa-dev/sdk";
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button } from "antd";
import styled from "styled-components";
import { MessageCircleQuestionIcon } from "lucide-react";
import { GlobalContext } from "../main";
import { Lang } from "../utils/constants";

const { Title, Paragraph, Text } = Typography;

const HELP_CHAT_USERNAME = import.meta.env.VITE_HELP_CHAT_USERNAME;

const StyledSection = styled.section`
  margin-bottom: 1rem;
`;

const StyledList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

const StyledListItem = styled.li`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-direction: column;
`;

const StyledButton = styled(Button)`
  margin-bottom: 1rem;
  width: 100%;
`;

const HelpPage = () => {
  const navigate = useNavigate();
  const { userContext } = useContext(GlobalContext);
  const lang = userContext?.lang || Lang.EN;

  useEffect(() => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(() => {
      navigate(-1);
    });
    return () => {
      WebApp.BackButton.hide();
    };
  }, [navigate]);

  const handleTelegramChat = () => {
    window.open(`https://t.me/${HELP_CHAT_USERNAME}`, "_blank");
  };
  if (lang === Lang.RU) {
  return (
    <div className="page">
      <StyledSection>
        <Title level={3}>Как это работает</Title>
        <StyledList>
          <StyledListItem>
            <Text strong>📦 Нужно отправить посылку?</Text>
            <Paragraph>Создайте объявление или выберите курьера из списка.</Paragraph>
          </StyledListItem>
          <StyledListItem>
            <Text strong>✈️ Летите и хотите доставить?</Text>
            <Paragraph>Разместите своё предложение или выберите подходящую посылку из списка.</Paragraph>
          </StyledListItem>
          <StyledListItem>
            <Text strong>🤝 Договоритесь напрямую</Text>
            <Paragraph>Обсудите детали: место встречи, дата, оплата.</Paragraph>
          </StyledListItem>
          <StyledListItem>
            <Text strong>🛡️ Безопасность прежде всего</Text>
            <Paragraph>Оплата — только после доставки. Нарушения — блокировка.</Paragraph>
          </StyledListItem>
        </StyledList>
      </StyledSection>

      <StyledSection>
        <Title level={3}>Правила и безопасность</Title>
        <StyledList>
          <StyledListItem>
            <Text strong>🔒 Безопасность превыше всего</Text>
            <Paragraph>Никогда не пересылайте запрещённые предметы (оружие, наркотики и пр.).</Paragraph>
          </StyledListItem>
          <StyledListItem>
            <Text strong>💸 Оплата — только по факту доставки</Text>
            <Paragraph>Не переводите деньги заранее. Жалоба = блокировка пользователя.</Paragraph>
          </StyledListItem>
          <StyledListItem>
            <Text strong>🚫 Мошенничество запрещено</Text>
            <Paragraph>Все сделки — только по договорённости между пользователями. Администрация не несёт ответственности за потери, задержки и споры.</Paragraph>
          </StyledListItem>
        </StyledList>
      </StyledSection>

      <StyledSection>
        <Title level={3}>Профиль</Title>
        <Text strong>В этом разделе вы можете указать:</Text>
        <StyledList>
          <StyledListItem>
            <Text>🧾 ФИО</Text>
          </StyledListItem>
          <StyledListItem>
            <Text >📞 Номер телефона</Text>
          </StyledListItem>
          <StyledListItem>
            <Text>📧 Email</Text>
          </StyledListItem>
        </StyledList>
        <Paragraph>
          Эти данные помогут упростить общение с попутчиками и повысить доверие. 
          Информация не будет отображаться публично без вашего согласия.
        </Paragraph>
      </StyledSection>

      <StyledSection>
        <Title level={3}>Поддержка</Title>
        <Paragraph>
          Если у вас возникли вопросы или жалобы — напишите нам. 
          Мы стараемся отвечать всем, но из-за ограниченного количества сотрудников 
          время ответа может быть увеличено.
        </Paragraph>
        <StyledButton 
          type="primary" 
          icon={<MessageCircleQuestionIcon />}
          onClick={handleTelegramChat}
        >
          Связаться с поддержкой
        </StyledButton>
        <Paragraph>
          <Text type="secondary">
            ⏳ Пожалуйста, отнеситесь с пониманием — ответ может занять до нескольких дней.
          </Text>
        </Paragraph>
      </StyledSection>
    </div>
  );
  } else {
    return (
      <div className="page">
        <StyledSection>
          <Title level={3}>How It Works</Title>
          <StyledList>
            <StyledListItem>
              <Text strong>📦 Want to send a package?</Text>
              <Paragraph>Create a listing or choose a courier from the list.</Paragraph>
            </StyledListItem>
            <StyledListItem>
              <Text strong>✈️ Flying and want to deliver?</Text>
              <Paragraph>Post your offer or select a suitable package from the list.</Paragraph>
            </StyledListItem>
            <StyledListItem>
              <Text strong>🤝 Communicate directly</Text>
              <Paragraph>Agree on the details: meeting point, date, and payment.</Paragraph>
            </StyledListItem>
            <StyledListItem>
              <Text strong>🛡️ Safety first</Text>
              <Paragraph>Payment only after delivery. Violators will be blocked.</Paragraph>
            </StyledListItem>
          </StyledList>
        </StyledSection>

        <StyledSection>
          <Title level={3}>Rules & Safety</Title>
          <StyledList>
            <StyledListItem>
              <Text strong>🔒 Safety First</Text>
              <Paragraph>Never send prohibited items (weapons, drugs, etc.).</Paragraph>
            </StyledListItem>
            <StyledListItem>
              <Text strong>💸 Pay Only After Delivery</Text>
              <Paragraph>Never pay in advance. Reports of early payment requests will lead to account suspension.</Paragraph>
            </StyledListItem>
            <StyledListItem>
              <Text strong>🚫 No Scams Allowed</Text>
              <Paragraph>All arrangements are made directly between users. The platform is not liable for losses, delays, or disputes.</Paragraph>
            </StyledListItem>
          </StyledList>
        </StyledSection>

        <StyledSection>
          <Title level={3}>Profile</Title>
          <Text strong>Here you can provide:</Text>
          <StyledList>
            <StyledListItem>
              <Text>🧾 Full Name</Text>
            </StyledListItem>
            <StyledListItem>
              <Text>📞 Phone Number</Text>
            </StyledListItem>
            <StyledListItem>
              <Text>📧 Email Address</Text>
            </StyledListItem>
          </StyledList>
          <Paragraph>
            These details help build trust and improve communication. 
            Your information won't be shared publicly without your consent.
          </Paragraph>
        </StyledSection>

        <StyledSection>
          <Title level={3}>Support</Title>
          <Paragraph>
            If you have a question or complaint, feel free to contact us. 
            Please note: we are a small team, and response times may be delayed.
          </Paragraph>
          <StyledButton 
            type="primary" 
            icon={<MessageCircleQuestionIcon />}
            onClick={handleTelegramChat}
          >
            Contact Support
          </StyledButton>
          <Paragraph>
            <Text type="secondary">
              ⏳ Kindly allow a few days for a reply. Thank you for your patience.
            </Text>
          </Paragraph>
        </StyledSection>
      </div>
    );
  }
};

export default HelpPage;