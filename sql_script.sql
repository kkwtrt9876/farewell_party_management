create database hammad;
use hammad; 

SELECT TABLE_SCHEMA
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'menu_poll';

SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'menu_poll' AND TABLE_SCHEMA = 'hamamd' AND COLUMN_NAME != 'email';



create table teachers(
name varchar(50),
email varchar(50),
no_family_members int,
foreign key(email) references actors(email)
);

create table actors(
email varchar(50),
password varchar(50),
roll varchar(50),
primary key(email)
);


create table students(
name varchar(50),
address varchar(100) not null,
contact int,
email varchar(100),
foreign key (email) references actors(email)
);

create table student_family(
email varchar(50),
fmembername varchar(50),
fmembercontact int ,
foreign key(email) references actors(email)
);

select * from student_family;

select * from students;


select * from actors;
select * from teachers;

CREATE TABLE menu_poll(
    Biryani int DEFAULT 0,
    Karahi int DEFAULT 0,
    Nihari int DEFAULT 0,
    Qorma int DEFAULT 0,
    Haleem int DEFAULT 0,
    Paya int DEFAULT 0,
    Saag int DEFAULT 0,
    PalakPaneer int DEFAULT 0,
    Daal int DEFAULT 0,
    ChapliKebab int DEFAULT 0,
    TandooriChicken int DEFAULT 0,
    ChickenHandi int DEFAULT 0,
    BhindiMasala int DEFAULT 0,
    AlooGobi int DEFAULT 0,
    ShamiKebab int DEFAULT 0, 
    SeekhKebab int DEFAULT 0,
    CholeBhature int DEFAULT 0,
    Keema int DEFAULT 0,
    KadhiPakora int DEFAULT 0,
    MuttonCurry int DEFAULT 0,
    GulabJamun int DEFAULT 0,
    Jalebi int DEFAULT 0,
    Kheer int DEFAULT 0,
    RasMalai int DEFAULT 0,
    Barfi int DEFAULT 0,
    Rabri int DEFAULT 0,
    Laddu int DEFAULT 0,
    Phirni int DEFAULT 0,
    Halwa int DEFAULT 0,
    SheerKhurma int DEFAULT 0,
    email varchar(50),
    FOREIGN KEY(email) REFERENCES actors(email) 
);

create table student_selection_menue(
email varchar(50),
item1 varchar(50) default 'not',
item2 varchar(50) default 'not',
item3 varchar(50) default 'not',
item4 varchar(50) default 'not',
item5 varchar(50) default 'not',
item6 varchar(50) default 'not',
item7 varchar(50) default 'not',
item8 varchar(50) default 'not',
item9 varchar(50) default 'not',
item10 varchar(50) default 'not',
foreign key(email) references actors(email)
);

create table performance_poll(
MusicalPerformance int default 0,
DanceShow int default 0,
StandUpComedy int default 0,
PoetryRecital int default 0,
email varchar (50) ,
foreign key(email) references actors(email)
);

create table student_selection_performer(
email varchar(50),
performance1 varchar(50) default 'not',
performance2 varchar(50) default 'not',
performance3 varchar(50) default 'not',
performance4 varchar(50) default 'not',
foreign key(email) references actors(email)
);

create table invitations(
email varchar(50),
name varchar(50),
type varchar(50),
foreign key(email) references actors(email)
);


insert into student_selection_menue values ('jabbar');

select * from student_selection_menue;
select * from menu_poll;
select * from student_family;
select * from students;
select * from actors;

insert into actors values ('invm@id.com',1234,'Manager of Invitation Team');

select * from invitations;


select * from student_selection_performer;
select * from performance_poll;



CREATE TABLE all_menu (
    item_name VARCHAR(50),
    price int
);

drop table all_menu;

INSERT INTO all_menu VALUES
    ('Biryani',25000),
    ('Karahi',30000),
    ('Nihari',20000),
    ('Qorma',20000),
    ('Haleem',20000), 
    ('Paya',20000),
    ('Saag',20000),
    ('PalakPaneer',30000), 
    ('Daal',30000),
    ('ChapliKebab',30000),
    ('TandooriChicken',30000),
    ('ChickenHandi',30000),
    ('BhindiMasala',30000),
    ('AlooGobi',10000),
    ('ShamiKebab',10000),
    ('SeekhKebab',10000),
    ('CholeBhature',10000),
    ('Keema',10000),
    ('KadhiPakora',10000),
    ('MuttonCurry',10000), 
    ('GulabJamun',10000), 
    ('Jalebi',10000),
    ('Kheer',10000),
    ('RasMalai',10000),
    ('Barfi',10000),
    ('Rabri',10000),
    ('Laddu',10000),
    ('Phirni',10000),
    ('Halwa',10000), 
    ('SheerKhurma',10000);
    

TRUNCATE TABLE final_menu;

select * from all_menu;-- 
select * from menu_poll;

create table final_menu(
item_name varchar(50),
price int
);

select * from final_menu;
drop table final_menu;

create table budget(
name varchar(50) not null unique,
total_amount int,
left_amount int,
email varchar(50) default 'bm@id.com',
foreign key(email) references actors(email),
primary key (name)
);

drop table budget;


create table expenses(
name varchar(50) not null,
type varchar(50),
amount int,
foreign key(type) references budget(name)
);

drop table expenses;

insert into actors values ('bm@id.com','1234','Budget Manager');

insert into budget (name,total_amount,left_amount) values('food',200000,200000);
insert into budget (name,total_amount,left_amount) values('catering',200000,200000);
insert into budget (name,total_amount,left_amount) values('lightning',200000,200000);
insert into budget (name,total_amount,left_amount) values('performance',200000,200000);
insert into budget (name,total_amount,left_amount) values('artists',200000,200000);
insert into budget (name,total_amount,left_amount) values('security',200000,200000);

DELIMITER $$
CREATE PROCEDURE InsertExpense(
    IN expense_name VARCHAR(50),
    IN expense_type VARCHAR(50),
    IN expense_amount INT
)
BEGIN
    DECLARE current_left_amount INT;

    -- Fetch the current left_amount for the selected type
    SELECT left_amount INTO current_left_amount
    FROM budget
    WHERE name = expense_type;

    -- Check if the remaining budget is sufficient
    IF current_left_amount >= expense_amount THEN
        -- Update the budget's left_amount
        UPDATE budget
        SET left_amount = left_amount - expense_amount
        WHERE name = expense_type;

        -- Insert the expense into the expenses table
        INSERT INTO expenses (name, type, amount)
        VALUES (expense_name, expense_type, expense_amount);
    ELSE
        -- Raise a signal or error
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Budget constraints: Not enough budget for this expense.';
    END IF;
END$$
DELIMITER ;

-- Create a trigger to ensure left_amount does not go below zero
DELIMITER $$
CREATE TRIGGER prevent_negative_budget
BEFORE UPDATE ON budget
FOR EACH ROW
BEGIN
    IF NEW.left_amount < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Budget constraints: Left amount cannot be negative.';
    END IF;
END$$
DELIMITER ;



select * from budget;


select * from actors;
insert into actors values ('dinm@id.com','1234','Manager of Dinner Menu Team');

drop table invitations;
drop table student_selection_menue;
drop table menu_poll;
drop table teachers;
drop table actors;
drop table students;

create table all_performers(
name varchar(50),
type varchar(50),
duration varchar(50),
requirments varchar(150),
primary key(name)
);

insert into all_performers(name, type , duration , requirments) values ('MusicalPerformance','Singing','20 mins','Microphone, Speakers');
insert into all_performers(name, type , duration , requirments) values ('DanceShow','Dance','15 mins','Dance Floor, Lights');
insert into all_performers(name, type , duration , requirments) values ('StandUpComedy','Comedy','10 mins','Microphone');
insert into all_performers(name, type , duration , requirments) values ('PoetryRecital','Poetry','5 mins','Microphone, Background Music');

truncate table all_performers;

drop table all_performers;
drop table finalize_performance;

select * from performance_poll;

create table finalize_performance(
email varchar(50) default 'pm@id.com',
name varchar(50),
time datetime default '2024-05-11 14:30:00',
duration varchar(50),
rehersal int default 0,
venue varchar(50) default 'not',
foreign key(email) references actors(email)
);

truncate table finalize_performance;

select * from finalize_performance;
drop table finalize_performance;

create table student_perfromer_suggestions(
name varchar(50),
type varchar(50),
duration varchar(50),
requirments varchar(150),
email varchar(50),
foreign key(email) references actors(email)
);

insert into actors values ('pm@id.com','1234','Manager of Performance Team');

create table access_table(
name varchar(50),
access int default 0
);

insert into access_table (name) values('performance');
insert into access_table (name) values('menu');
select * from access_table;-- 

insert into actors values ('tm@id.com','1234','Task Manager');

create table tasks(
manager_email varchar(50) default 'tm@id.com', 
assigned_to varchar (50),
define_task varchar(500),
status int default 0,
foreign key (manager_email) references actors(email),
foreign key (assigned_to) references actors(email)
);

select * from tasks;
truncate table tasks;

select * from actors;

show tables;


