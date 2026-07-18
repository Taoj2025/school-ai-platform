"""
演示数据生成脚本 (异步版本)
用于生成 Apple 子系统的演示数据

使用方法:
    python scripts/seed_demo_data.py

前置条件:
    1. 数据库已启动并可连接
    2. 数据库表已创建 (alembic upgrade head)
    3. 环境变量 DATABASE_URL 已设置
"""

import os
import sys
import asyncio
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List
import random

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'apps', 'api'))

from sqlalchemy import select
from app.db.session import async_session
from app.modules.accounts.models import User, Role
from app.modules.apple.awards.models import AppleAward, AppleAwardRecipient
from app.modules.apple.finance.models import AppleFinanceRecord
from app.modules.apple.assets.models import AppleAsset
from app.modules.apple.students.models import AppleStudent, AppleAttendance
from app.core.security import get_password_hash


def random_date(start_days_ago: int = 365, end_days_ago: int = 0) -> str:
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).strftime('%Y-%m-%d')


async def create_roles(db):
    print("Creating roles...")
    result = await db.execute(select(Role).limit(1))
    existing = result.scalar_one_or_none()
    if existing:
        print("  Roles already exist, skipping...")
        result = await db.execute(select(Role))
        return list(result.scalars().all())

    roles = [
        Role(name='admin', description='Administrator'),
        Role(name='apple', description='Apple Subsystem User'),
        Role(name='danielle', description='Danielle User'),
        Role(name='steven', description='Steven User'),
        Role(name='tommy', description='Tommy User'),
        Role(name='wendy', description='Wendy User'),
        Role(name='leung', description='Leung User'),
        Role(name='reviewer', description='Reviewer'),
    ]
    for role in roles:
        db.add(role)
    await db.commit()
    print(f"  Created {len(roles)} roles")
    return roles


async def create_users(db):
    print("Creating users...")
    result = await db.execute(select(User).limit(1))
    existing = result.scalar_one_or_none()
    if existing:
        print("  Users already exist, skipping...")
        result = await db.execute(select(User))
        return list(result.scalars().all())

    users = [
        User(
            username='admin',
            email='admin@school.edu.hk',
            display_name='系統管理員',
            hashed_password=get_password_hash('password123'),
            is_active=True,
        ),
        User(
            username='apple',
            email='apple@school.edu.hk',
            display_name='Apple 負責人',
            hashed_password=get_password_hash('password123'),
            is_active=True,
        ),
        User(
            username='teacher1',
            email='teacher1@school.edu.hk',
            display_name='陳老師',
            hashed_password=get_password_hash('password123'),
            is_active=True,
        ),
    ]
    for user in users:
        db.add(user)
    await db.commit()
    print(f"  Created {len(users)} users")
    return users


async def create_awards(db):
    print("Creating awards...")
    result = await db.execute(select(AppleAward).limit(1))
    existing = result.scalar_one_or_none()
    if existing:
        print("  Awards already exist, skipping...")
        result = await db.execute(select(AppleAward))
        return list(result.scalars().all())

    awards_data = [
        {
            'name': '學業優異獎',
            'award_type': 'academic',
            'amount': Decimal('1000.00'),
            'semester': '上學期',
            'academic_year': '2025-2026',
            'status': 'published',
            'description': '表彰學期內學業成績優異的學生',
        },
        {
            'name': '品行優良獎',
            'award_type': 'conduct',
            'amount': Decimal('500.00'),
            'semester': '上學期',
            'academic_year': '2025-2026',
            'status': 'published',
            'description': '表彰品行優良的學生',
        },
        {
            'name': '服務精神獎',
            'award_type': 'service',
            'amount': Decimal('500.00'),
            'semester': '上學期',
            'academic_year': '2025-2026',
            'status': 'published',
            'description': '表彰服務學校有突出表現的學生',
        },
    ]
    awards = []
    for data in awards_data:
        award = AppleAward(**data)
        db.add(award)
        awards.append(award)
    await db.commit()
    print(f"  Created {len(awards)} awards")
    return awards


async def create_students(db, count: int = 50):
    print(f"Creating {count} students...")
    result = await db.execute(select(AppleStudent).limit(1))
    existing = result.scalar_one_or_none()
    if existing:
        print("  Students already exist, skipping...")
        result = await db.execute(select(AppleStudent))
        return list(result.scalars().all())

    classes = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B']
    genders = ['M', 'F']
    names_male = ['陳小明', '李大文', '張志偉', '王建宏', '劉德華', '周杰倫', '吳偉強', '孫國明', '鄭家輝', '黃志明']
    names_female = ['陳美美', '李雅文', '張淑芬', '王小紅', '劉秀英', '周慧敏', '吳婉君', '孫雅琪', '鄭思敏', '黃麗娟']

    students = []
    for i in range(count):
        gender = random.choice(genders)
        name = random.choice(names_male) if gender == 'M' else random.choice(names_female)
        student_class = random.choice(classes)
        student_no = f"2025{student_class[0]}{str(i+1).zfill(3)}"

        student = AppleStudent(
            name_zh=name,
            name_en=name,
            student_no=student_no,
            class_name=student_class,
            gender=gender,
            admission_date=datetime(2025, 9, 1).date(),
            status='active',
            date_of_birth=datetime(2010, random.randint(1, 12), random.randint(1, 28)).date(),
            parent_name=f"{name}家長",
            parent_phone=f"{random.randint(5, 9)}{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
            address=f"香港九龍{random.choice(['彩虹區', '深水埗', '旺角', '太子'])}{random.choice(['道', '街', '路'])}{random.randint(1, 999)}號",
        )
        db.add(student)
        students.append(student)

    await db.commit()
    print(f"  Created {len(students)} students")
    return students


async def create_finance_records(db, count: int = 100):
    print(f"Creating {count} finance records...")
    result = await db.execute(select(AppleFinanceRecord).limit(1))
    existing = result.scalar_one_or_none()
    if existing:
        print("  Finance records already exist, skipping...")
        result = await db.execute(select(AppleFinanceRecord))
        return list(result.scalars().all())

    income_categories = ['tuition', 'donation', 'activity', 'other']
    expense_categories = ['supplies', 'maintenance', 'activity', 'salary', 'other']

    records = []
    for i in range(count // 2):
        income = AppleFinanceRecord(
            record_type='income',
            transaction_date=datetime.strptime(random_date(180, 1), '%Y-%m-%d').date(),
            description=random.choice(['學費收入', '捐贈', '活動收費']),
            amount=Decimal(str(random.randint(1000, 50000))),
            category=random.choice(income_categories),
            academic_year='2025-2026',
            payment_method=random.choice(['cash', 'bank_transfer', 'cheque']),
            status='confirmed',
        )
        db.add(income)
        records.append(income)

    for i in range(count // 2):
        expense = AppleFinanceRecord(
            record_type='expense',
            transaction_date=datetime.strptime(random_date(180, 1), '%Y-%m-%d').date(),
            description=random.choice(['辦公用品', '設備維修', '活動支出', '清潔費用']),
            amount=Decimal(str(random.randint(500, 20000))),
            category=random.choice(expense_categories),
            academic_year='2025-2026',
            payment_method=random.choice(['cash', 'bank_transfer', 'credit_card']),
            status='confirmed',
        )
        db.add(expense)
        records.append(expense)

    await db.commit()
    print(f"  Created {len(records)} finance records")
    return records


async def create_assets(db, count: int = 200):
    print(f"Creating {count} assets...")
    result = await db.execute(select(AppleAsset).limit(1))
    existing = result.scalar_one_or_none()
    if existing:
        print("  Assets already exist, skipping...")
        result = await db.execute(select(AppleAsset))
        return list(result.scalars().all())

    categories = ['equipment', 'furniture', 'vehicle', 'building', 'other']
    locations = ['3樓教員室', '地下校務處', '1樓禮堂', '2樓圖書館', '4樓實驗室', '操场', '2樓美術室']
    statuses = ['in_use', 'maintenance', 'written_off']

    assets = []
    for i in range(count):
        asset_category = random.choice(categories)
        location = random.choice(locations)

        asset = AppleAsset(
            asset_code=f"{asset_category[:2].upper()}-2025-{str(i+1).zfill(4)}",
            name=random.choice(['投影機', '辦公桌', '打印機', '冷氣機', '課室椅子', '會議桌', '白板', '投影屏幕']),
            category=asset_category,
            location=location,
            status=random.choices(statuses, weights=[85, 10, 5])[0],
            purchase_date=datetime.strptime(random_date(730, 30), '%Y-%m-%d').date(),
            purchase_price=Decimal(str(random.randint(500, 50000))),
            current_value=Decimal(str(random.randint(100, 25000))),
        )
        db.add(asset)
        assets.append(asset)

    await db.commit()
    print(f"  Created {len(assets)} assets")
    return assets


async def create_attendance(db, students, records_per_student: int = 10):
    print(f"Creating attendance records...")
    attendances = []
    for student in students[:20]:
        for _ in range(records_per_student):
            status = random.choices(
                ['present', 'absent', 'late', 'sick'],
                weights=[75, 10, 10, 5]
            )[0]
            attendance = AppleAttendance(
                student_id=student.id,
                date=datetime.strptime(random_date(30, 1), '%Y-%m-%d').date(),
                status=status,
                remark='病假' if status == 'sick' else None,
            )
            db.add(attendance)
            attendances.append(attendance)
    await db.commit()
    print(f"  Created {len(attendances)} attendance records")
    return attendances


async def create_award_recipients(db, awards, students):
    print("Creating award recipients...")
    count = 0
    for award in awards:
        for student in random.sample(students, min(len(students), 5)):
            recipient = AppleAwardRecipient(
                award_id=award.id,
                student_id=student.id,
                student_name=student.name_zh,
                class_name=student.class_name,
                reason='学业优异',
                status='confirmed',
            )
            db.add(recipient)
            count += 1
    await db.commit()
    print(f"  Created {count} award recipients")


async def main():
    print("=" * 50)
    print("Apple 子系统演示数据生成脚本 (异步版本)")
    print("=" * 50)
    print()

    async with async_session() as db:
        try:
            users = await create_users(db)
            roles = await create_roles(db)
            awards = await create_awards(db)
            students = await create_students(db, count=50)
            finance_records = await create_finance_records(db, count=100)
            assets = await create_assets(db, count=200)
            attendances = await create_attendance(db, students, records_per_student=10)
            await create_award_recipients(db, awards, students)

            print()
            print("=" * 50)
            print("演示数据生成完成！")
            print("=" * 50)
            print()
            print("数据统计:")
            print(f"  - 用户: {len(users)}")
            print(f"  - 角色: {len(roles)}")
            print(f"  - 奖项: {len(awards)}")
            print(f"  - 学生: {len(students)}")
            print(f"  - 财务记录: {len(finance_records)}")
            print(f"  - 资产: {len(assets)}")
            print(f"  - 考勤记录: {len(attendances)}")
            print()
            print("登录账号:")
            print("  - admin / password123")
            print("  - apple / password123")
            print("  - teacher1 / password123")

        except Exception as e:
            print(f"Error: {e}")
            await db.rollback()
            raise


if __name__ == '__main__':
    asyncio.run(main())
