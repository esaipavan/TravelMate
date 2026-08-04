-- Migration 013: Persistent AI conversation history per trip
-- Each user has one active conversation per trip; messages are stored in ai_messages.

CREATE TABLE IF NOT EXISTS ai_conversations (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id      uuid        REFERENCES trips(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid        NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role             text        NOT NULL CHECK (role IN ('user', 'assistant')),
  content          text        NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Row-Level Security
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own AI conversations"
  ON ai_conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access messages in their conversations"
  ON ai_messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS ai_conversations_user_trip
  ON ai_conversations(user_id, trip_id);

CREATE INDEX IF NOT EXISTS ai_messages_conv_created
  ON ai_messages(conversation_id, created_at);

-- Auto-update updated_at on ai_conversations when messages are added
CREATE OR REPLACE FUNCTION _touch_ai_conversation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE ai_conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ai_message_touches_conversation
  AFTER INSERT ON ai_messages
  FOR EACH ROW EXECUTE FUNCTION _touch_ai_conversation();
