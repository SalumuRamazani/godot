extends Node2D

@onready var player = $Player
@onready var enemy_spawner = $EnemySpawner
@onready var score_label = $UI/Score
@onready var game_over_panel = $UI/GameOver
@onready var final_score_label = $UI/GameOver/VBoxContainer/FinalScore

var enemy_scene = preload("res://scenes/enemy.tscn")
var score = 0
var game_active = true

func _ready():
	player.connect("player_died", _on_player_died)

func _process(_delta):
	if not game_active and Input.is_action_just_pressed("shoot"):
		restart_game()

func _on_enemy_spawner_timeout():
	if not game_active:
		return

	var enemy = enemy_scene.instantiate()
	enemy.position = Vector2(randf_range(50, 750), -50)
	enemy.connect("enemy_destroyed", _on_enemy_destroyed)
	add_child(enemy)

	# Increase difficulty over time
	if enemy_spawner.wait_time > 0.5:
		enemy_spawner.wait_time -= 0.05

func _on_enemy_destroyed():
	score += 10
	score_label.text = "Score: " + str(score)

func _on_player_died():
	game_active = false
	enemy_spawner.stop()
	game_over_panel.visible = true
	final_score_label.text = "Score: " + str(score)

func _on_restart_button_pressed():
	restart_game()

func restart_game():
	get_tree().reload_current_scene()
