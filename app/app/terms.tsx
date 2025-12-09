import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TopNavBar } from '@/components/navigation';
import { useAppStore } from '@/store';
import { theme } from '@/constants/theme';

/**
 * TermsScreen
 *
 * 이용약관 화면
 */
export default function TermsScreen() {
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="이용약관" showBackButton />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Rezom 서비스 이용약관
        </Text>
        <Text style={[styles.date, isDark && styles.dateDark]}>
          시행일: 2025년 11월 1일
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제1조 (목적)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            본 약관은 Rezom(이하 "회사")이 제공하는 모바일 애플리케이션 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제2조 (정의)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            1. "서비스"란 회사가 제공하는 커뮤니티 및 투표 기능이 포함된 모바일 애플리케이션 서비스를 말합니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            3. "회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 이용자를 말합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제3조 (약관의 효력 및 변경)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경사항을 서비스 내 공지사항을 통해 공지합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제4조 (회원가입)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 등록 내용에 허위, 기재누락, 오기가 있는 경우
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제5조 (서비스의 제공 및 변경)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            1. 회사는 다음과 같은 서비스를 제공합니다:
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 커뮤니티 서비스 (질문, 답변, 모임)
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 투표 및 의견 공유 서비스
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 기타 회사가 정하는 서비스
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            2. 회사는 필요한 경우 서비스의 내용을 변경할 수 있으며, 이 경우 변경된 서비스의 내용 및 제공일자를 명시하여 공지합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제6조 (서비스의 중단)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제7조 (이용자의 의무)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            이용자는 다음 행위를 하여서는 안 됩니다:
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 타인의 정보 도용
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 회사가 게시한 정보의 변경
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 회사 기타 제3자의 저작권 등 지적재산권에 대한 침해
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제8조 (게시물의 관리)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            1. 이용자가 서비스 내에 게시한 게시물의 내용에 대한 권리와 책임은 게시자에게 있습니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            2. 회사는 게시물이 다음 각 호에 해당한다고 판단되는 경우 사전통지 없이 삭제할 수 있습니다:
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 본 약관에 위배되는 경우
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 타인의 권리를 침해하거나 명예를 훼손하는 경우
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 공공질서 및 미풍양속에 위반되는 경우
          </Text>
          <Text style={[styles.listItem, isDark && styles.listItemDark]}>
            • 범죄적 행위에 결부된다고 인정되는 경우
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제9조 (개인정보보호)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            회사는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력하며, 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제10조 (면책조항)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            제11조 (분쟁해결)
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            2. 회사와 이용자 간에 발생한 분쟁은 전자거래기본법 제28조 및 동 시행령 제15조에 의하여 설치된 전자거래분쟁조정위원회의 조정에 따를 수 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            부칙
          </Text>
          <Text style={[styles.paragraph, isDark && styles.paragraphDark]}>
            본 약관은 2025년 11월 1일부터 시행됩니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
            Rezom
          </Text>
          <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
            이용 중 문의사항이 있으시면 앱 내 문의하기를 이용해주세요.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  titleDark: {
    color: 'white',
  },
  date: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    marginBottom: theme.spacing.xl,
  },
  dateDark: {
    color: '#8E8E93',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  sectionTitleDark: {
    color: 'white',
  },
  paragraph: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  paragraphDark: {
    color: '#D1D1D6',
  },
  listItem: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
  },
  listItemDark: {
    color: '#D1D1D6',
  },
  footer: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  footerTextDark: {
    color: '#636366',
  },
});
