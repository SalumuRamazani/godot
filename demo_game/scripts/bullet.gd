extends Area2D

@export var speed = 500.0

func _process(delta):
	position.y -= speed * delta

func _on_area_entered(area):
	if area.is_in_group("enemies"):
		area.destroy()
		queue_free()

func _on_screen_exited():
	queue_free()
